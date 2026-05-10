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
const FOLDER_INCLUDE = {
    tower: { select: { id: true, nama: true } },
    _count: { select: { dokumen: true } },
};
let AsBuiltDrawingService = class AsBuiltDrawingService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAllFolders(query) {
        const where = {};
        if (query.tipe)
            where.tipe = query.tipe;
        if (query.tahun)
            where.tahun = Number(query.tahun);
        if (query.towerId)
            where.towerId = query.towerId;
        if (query.search)
            where.nama = { contains: query.search, mode: 'insensitive' };
        return this.prisma.asBuiltFolder.findMany({ where, include: FOLDER_INCLUDE, orderBy: { createdAt: 'desc' } });
    }
    async findFolder(id) {
        const folder = await this.prisma.asBuiltFolder.findUnique({
            where: { id },
            include: { ...FOLDER_INCLUDE, dokumen: { orderBy: { createdAt: 'desc' } } },
        });
        if (!folder)
            throw new common_1.NotFoundException(`Folder ${id} tidak ditemukan`);
        return folder;
    }
    createFolder(dto) {
        const { towerId, ...rest } = dto;
        return this.prisma.asBuiltFolder.create({
            data: { ...rest, ...(towerId && { tower: { connect: { id: towerId } } }) },
            include: FOLDER_INCLUDE,
        });
    }
    async updateFolder(id, dto) {
        await this.findFolder(id);
        const { towerId, ...rest } = dto;
        return this.prisma.asBuiltFolder.update({
            where: { id },
            data: {
                ...rest,
                ...(towerId !== undefined && {
                    tower: towerId ? { connect: { id: towerId } } : { disconnect: true },
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
        return this.prisma.asBuiltDokumen.findMany({ where: { folderId }, orderBy: { createdAt: 'desc' } });
    }
    async findDokumen(id) {
        const doc = await this.prisma.asBuiltDokumen.findUnique({ where: { id } });
        if (!doc)
            throw new common_1.NotFoundException(`Dokumen ${id} tidak ditemukan`);
        return doc;
    }
    async addDokumen(folderId, namaFile, fileUrl) {
        await this.findFolder(folderId);
        return this.prisma.asBuiltDokumen.create({ data: { folderId, namaFile, fileUrl } });
    }
    async deleteDokumen(id) {
        await this.findDokumen(id);
        return this.prisma.asBuiltDokumen.delete({ where: { id } });
    }
};
exports.AsBuiltDrawingService = AsBuiltDrawingService;
exports.AsBuiltDrawingService = AsBuiltDrawingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AsBuiltDrawingService);
//# sourceMappingURL=as-built-drawing.service.js.map