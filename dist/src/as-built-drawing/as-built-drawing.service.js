"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsBuiltDrawingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const CREATED_BY = { select: { id: true, nama: true, role: true } };
const FOLDER_INCLUDE = {
    tower: { select: { id: true, nama: true } },
    createdBy: CREATED_BY,
    _count: { select: { dokumen: true, children: true } },
};
const DOKUMEN_INCLUDE = { createdBy: CREATED_BY };
let AsBuiltDrawingService = class AsBuiltDrawingService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAllFolders(query) {
        const isRoot = !query.parentId || query.parentId === 'root' || query.parentId === 'null';
        const where = { parentId: isRoot ? null : query.parentId };
        if (query.tipe)
            where.tipe = query.tipe;
        if (query.tahun)
            where.tahun = Number(query.tahun);
        if (query.towerId)
            where.towerId = query.towerId;
        if (query.search)
            where.nama = { contains: query.search, mode: 'insensitive' };
        const [folders, rootDokumen] = await Promise.all([
            this.prisma.asBuiltFolder.findMany({ where, include: FOLDER_INCLUDE, orderBy: { createdAt: 'desc' } }),
            isRoot
                ? this.prisma.asBuiltDokumen.findMany({
                    where: { folderId: null, ...(query.search ? { namaFile: { contains: query.search, mode: 'insensitive' } } : {}) },
                    include: DOKUMEN_INCLUDE,
                    orderBy: { createdAt: 'desc' },
                })
                : Promise.resolve([]),
        ]);
        return { folders, rootDokumen };
    }
    async findFolder(id) {
        const folder = await this.prisma.asBuiltFolder.findUnique({
            where: { id },
            include: {
                ...FOLDER_INCLUDE,
                dokumen: { include: DOKUMEN_INCLUDE, orderBy: { createdAt: 'desc' } },
                children: { include: FOLDER_INCLUDE, orderBy: { createdAt: 'desc' } },
                parent: { select: { id: true, nama: true, parentId: true } },
            },
        });
        if (!folder)
            throw new common_1.NotFoundException(`Folder ${id} tidak ditemukan`);
        return folder;
    }
    async breadcrumb(id) {
        const chain = [];
        let cur = await this.prisma.asBuiltFolder.findUnique({
            where: { id },
            select: { id: true, nama: true, parentId: true },
        });
        while (cur) {
            chain.unshift({ id: cur.id, nama: cur.nama });
            if (!cur.parentId)
                break;
            cur = await this.prisma.asBuiltFolder.findUnique({
                where: { id: cur.parentId },
                select: { id: true, nama: true, parentId: true },
            });
        }
        return chain;
    }
    createFolder(dto, createdById) {
        const { towerId, tipe, parentId, ...rest } = dto;
        return this.prisma.asBuiltFolder.create({
            data: {
                ...rest,
                tipe: tipe ?? 'Lainnya',
                ...(towerId && { tower: { connect: { id: towerId } } }),
                ...(parentId && { parent: { connect: { id: parentId } } }),
                ...(createdById && { createdBy: { connect: { id: createdById } } }),
            },
            include: FOLDER_INCLUDE,
        });
    }
    async updateFolder(id, dto) {
        await this.findFolder(id);
        const { towerId, parentId, ...rest } = dto;
        return this.prisma.asBuiltFolder.update({
            where: { id },
            data: {
                ...rest,
                ...(towerId !== undefined && {
                    tower: towerId ? { connect: { id: towerId } } : { disconnect: true },
                }),
                ...(parentId !== undefined && {
                    parent: parentId ? { connect: { id: parentId } } : { disconnect: true },
                }),
            },
            include: FOLDER_INCLUDE,
        });
    }
    async deleteFolder(id) {
        await this.findFolder(id);
        return this.prisma.asBuiltFolder.delete({ where: { id } });
    }
    findDokumenByFolder(folderId) {
        return this.prisma.asBuiltDokumen.findMany({
            where: { folderId },
            include: DOKUMEN_INCLUDE,
            orderBy: { createdAt: 'desc' },
        });
    }
    async findDokumen(id) {
        const doc = await this.prisma.asBuiltDokumen.findUnique({ where: { id } });
        if (!doc)
            throw new common_1.NotFoundException(`Dokumen ${id} tidak ditemukan`);
        return doc;
    }
    async addDokumenMulti(folderId, docs, createdById) {
        if (folderId)
            await this.findFolder(folderId);
        if (!docs.length)
            return { count: 0, docs: [] };
        const created = await this.prisma.$transaction(docs.map((d) => this.prisma.asBuiltDokumen.create({
            data: { folderId: folderId ?? null, createdById: createdById ?? null, ...d },
            include: DOKUMEN_INCLUDE,
        })));
        return { count: created.length, docs: created };
    }
    async deleteDokumen(id) {
        await this.findDokumen(id);
        return this.prisma.asBuiltDokumen.delete({ where: { id } });
    }
    async bulkDelete(folderIds, dokumenIds) {
        const folders = Array.from(new Set(folderIds ?? []));
        const dokumens = Array.from(new Set(dokumenIds ?? []));
        if (!folders.length && !dokumens.length) {
            return { deletedFolders: 0, deletedDokumens: 0 };
        }
        const [folderRes, dokumenRes] = await this.prisma.$transaction([
            this.prisma.asBuiltFolder.deleteMany({ where: { id: { in: folders } } }),
            this.prisma.asBuiltDokumen.deleteMany({ where: { id: { in: dokumens } } }),
        ]);
        return { deletedFolders: folderRes.count, deletedDokumens: dokumenRes.count };
    }
};
exports.AsBuiltDrawingService = AsBuiltDrawingService;
exports.AsBuiltDrawingService = AsBuiltDrawingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AsBuiltDrawingService);
//# sourceMappingURL=as-built-drawing.service.js.map