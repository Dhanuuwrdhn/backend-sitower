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
exports.SertifikatService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SertifikatService = class SertifikatService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAllFolders(query) {
        return this.prisma.sertifikat.findMany({
            where: {
                ...(query?.kategori && { kategori: query.kategori }),
                ...(query?.status && { status: query.status }),
                ...(query?.search && {
                    tower: { nama: { contains: query.search, mode: 'insensitive' } },
                }),
            },
            include: {
                tower: { select: { id: true, nama: true } },
                _count: { select: { dokumen: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findFolder(id) {
        const folder = await this.prisma.sertifikat.findUnique({
            where: { id },
            include: {
                tower: { select: { id: true, nama: true } },
                dokumen: { orderBy: { createdAt: 'desc' } },
            },
        });
        if (!folder)
            throw new common_1.NotFoundException(`Folder ${id} tidak ditemukan`);
        return folder;
    }
    createFolder(dto) {
        return this.prisma.sertifikat.create({
            data: {
                nama: dto.nama,
                kategori: dto.kategori,
                status: dto.status ?? 'berlaku',
                ...(dto.towerId && { towerId: dto.towerId }),
                ...(dto.berlakuHingga && { berlakuHingga: new Date(dto.berlakuHingga) }),
            },
            include: { tower: { select: { id: true, nama: true } } },
        });
    }
    async updateFolder(id, dto) {
        await this.findFolder(id);
        return this.prisma.sertifikat.update({
            where: { id },
            data: {
                ...(dto.nama && { nama: dto.nama }),
                ...(dto.kategori && { kategori: dto.kategori }),
                ...(dto.status && { status: dto.status }),
                ...(dto.towerId !== undefined && { towerId: dto.towerId || null }),
                ...(dto.berlakuHingga && { berlakuHingga: new Date(dto.berlakuHingga) }),
            },
        });
    }
    async deleteFolder(id) {
        await this.findFolder(id);
        return this.prisma.sertifikat.delete({ where: { id } });
    }
    async findDokumenByFolder(folderId) {
        await this.findFolder(folderId);
        return this.prisma.sertifikatDokumen.findMany({
            where: { folderId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findDokumen(id) {
        const doc = await this.prisma.sertifikatDokumen.findUnique({
            where: { id },
            include: { folder: { select: { id: true, nama: true } } },
        });
        if (!doc)
            throw new common_1.NotFoundException(`Dokumen ${id} tidak ditemukan`);
        return doc;
    }
    async addDokumen(folderId, namaFile, fileUrl) {
        await this.findFolder(folderId);
        return this.prisma.sertifikatDokumen.create({
            data: { folderId, namaFile, fileUrl },
        });
    }
    async deleteDokumen(id) {
        await this.findDokumen(id);
        return this.prisma.sertifikatDokumen.delete({ where: { id } });
    }
};
exports.SertifikatService = SertifikatService;
exports.SertifikatService = SertifikatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SertifikatService);
//# sourceMappingURL=sertifikat.service.js.map