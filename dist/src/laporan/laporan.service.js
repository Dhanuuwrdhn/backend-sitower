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
exports.LaporanService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const INCLUDE_FULL = {
    tower: { select: { id: true, nama: true, tipe: true, tegangan: true, lokasi: true } },
    pelapor: { select: { id: true, nama: true, jabatan: true, unit: true } },
};
let LaporanService = class LaporanService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const page = Math.max(1, Number(query.page ?? 1));
        const limit = Math.min(100, Math.max(1, Number(query.limit ?? 10)));
        const skip = (page - 1) * limit;
        const where = {};
        if (query.jenisGangguan)
            where.jenisGangguan = query.jenisGangguan;
        if (query.status)
            where.status = query.status;
        if (query.levelRisiko)
            where.levelRisiko = query.levelRisiko;
        if (query.towerId)
            where.towerId = query.towerId;
        if (query.tglMulai || query.tglAkhir) {
            where.tanggal = {};
            if (query.tglMulai)
                where.tanggal.gte = new Date(query.tglMulai);
            if (query.tglAkhir)
                where.tanggal.lte = new Date(query.tglAkhir + 'T23:59:59');
        }
        if (query.search) {
            where.OR = [
                { tower: { nama: { contains: query.search, mode: 'insensitive' } } },
                { tower: { id: { contains: query.search, mode: 'insensitive' } } },
                { lokasiDetail: { contains: query.search, mode: 'insensitive' } },
                { deskripsi: { contains: query.search, mode: 'insensitive' } },
            ];
        }
        const [data, total] = await Promise.all([
            this.prisma.laporan.findMany({
                where,
                include: INCLUDE_FULL,
                orderBy: { tanggal: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.laporan.count({ where }),
        ]);
        return { data, total, page, limit };
    }
    async findOne(id) {
        const laporan = await this.prisma.laporan.findUnique({
            where: { id },
            include: INCLUDE_FULL,
        });
        if (!laporan)
            throw new common_1.NotFoundException(`Laporan ${id} tidak ditemukan`);
        return laporan;
    }
    async getStats() {
        const counts = await this.prisma.laporan.groupBy({
            by: ['jenisGangguan'],
            _count: { id: true },
        });
        const result = {
            ppl: 0, kebakaran: 0, layangan: 0, pencurian: 0,
            pemanfaatan: 0, gangguan: 0, cui: 0, cleanup: 0,
        };
        for (const c of counts) {
            const key = c.jenisGangguan === 'pekerjaan_pihak_lain' ? 'ppl' : c.jenisGangguan;
            result[key] = c._count.id;
        }
        const [total, berlangsung] = await Promise.all([
            this.prisma.laporan.count(),
            this.prisma.laporan.count({ where: { status: 'berlangsung' } }),
        ]);
        return { ...result, total, berlangsung };
    }
    create(dto, pelaporId) {
        const { towerId, tanggal, foto = [], ...rest } = dto;
        return this.prisma.laporan.create({
            data: {
                ...rest,
                tanggal: new Date(tanggal),
                foto,
                tower: { connect: { id: towerId } },
                pelapor: { connect: { id: pelaporId } },
            },
            include: INCLUDE_FULL,
        });
    }
    async update(id, dto) {
        await this.findOne(id);
        const { towerId, tanggal, pelaporId: _, ...rest } = dto;
        return this.prisma.laporan.update({
            where: { id },
            data: {
                ...rest,
                ...(tanggal && { tanggal: new Date(tanggal) }),
                ...(towerId && { tower: { connect: { id: towerId } } }),
            },
            include: INCLUDE_FULL,
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.laporan.delete({ where: { id } });
    }
    async updateFotoUrls(id, urls) {
        return this.prisma.laporan.update({
            where: { id },
            data: { foto: { push: urls } },
        });
    }
};
exports.LaporanService = LaporanService;
exports.LaporanService = LaporanService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LaporanService);
//# sourceMappingURL=laporan.service.js.map