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
    findAll(query) {
        return this.prisma.sertifikat.findMany({
            where: {
                ...(query?.towerId && { towerId: query.towerId }),
                ...(query?.status && { status: query.status }),
                ...(query?.tipe && { tipe: query.tipe }),
            },
            include: { tower: { select: { id: true, nama: true } } },
            orderBy: { berlakuHingga: 'asc' },
        });
    }
    async findOne(id) {
        const data = await this.prisma.sertifikat.findUnique({
            where: { id },
            include: { tower: { select: { id: true, nama: true } } },
        });
        if (!data)
            throw new common_1.NotFoundException(`Sertifikat ${id} tidak ditemukan`);
        return data;
    }
    create(dto) {
        return this.prisma.sertifikat.create({
            data: { ...dto, berlakuHingga: new Date(dto.berlakuHingga) },
        });
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.sertifikat.update({
            where: { id },
            data: {
                ...dto,
                ...(dto.berlakuHingga && { berlakuHingga: new Date(dto.berlakuHingga) }),
            },
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.sertifikat.delete({ where: { id } });
    }
    async updateFileUrl(id, fileUrl) {
        return this.prisma.sertifikat.update({ where: { id }, data: { fileUrl } });
    }
};
exports.SertifikatService = SertifikatService;
exports.SertifikatService = SertifikatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SertifikatService);
//# sourceMappingURL=sertifikat.service.js.map