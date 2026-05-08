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
let AsBuiltDrawingService = class AsBuiltDrawingService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll(query) {
        return this.prisma.asBuiltDrawing.findMany({
            where: {
                ...(query?.towerId && { towerId: query.towerId }),
                ...(query?.tipe && { tipe: query.tipe }),
                ...(query?.tahun && { tahun: Number(query.tahun) }),
            },
            include: { tower: { select: { id: true, nama: true } } },
            orderBy: { tahun: 'desc' },
        });
    }
    async findOne(id) {
        const data = await this.prisma.asBuiltDrawing.findUnique({
            where: { id },
            include: { tower: { select: { id: true, nama: true } } },
        });
        if (!data)
            throw new common_1.NotFoundException(`As-Built Drawing ${id} tidak ditemukan`);
        return data;
    }
    create(dto) {
        return this.prisma.asBuiltDrawing.create({ data: dto });
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.asBuiltDrawing.update({ where: { id }, data: dto });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.asBuiltDrawing.delete({ where: { id } });
    }
    async updateFileUrl(id, fileUrl) {
        return this.prisma.asBuiltDrawing.update({ where: { id }, data: { fileUrl } });
    }
};
exports.AsBuiltDrawingService = AsBuiltDrawingService;
exports.AsBuiltDrawingService = AsBuiltDrawingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AsBuiltDrawingService);
//# sourceMappingURL=as-built-drawing.service.js.map