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
const INCLUDE_LIST = {
    ...INCLUDE_FULL,
    progress: { orderBy: { createdAt: 'desc' }, take: 1, select: { tipe: true } },
};
const LEVEL_PRIORITY = {
    kritis_tidak_terpenuhi: 4,
    kritis_terpenuhi: 3,
    kritis: 3,
    sedang: 2,
    aman: 1,
};
const KERAWANAN_TYPES = new Set([
    'pekerjaan_pihak_lain', 'kebakaran', 'layangan', 'pencurian', 'pemanfaatan_lahan',
]);
const INITIAL_RIWAYAT_MARKER = '__initial__';
const INITIAL_RIWAYAT_FIELDS = [
    'statusKerawanan',
    'progresLaporan',
    'uraianPekerjaan',
    'upayaPengendalian',
    'pihakLain',
    'contactPerson',
    'foto',
    INITIAL_RIWAYAT_MARKER,
];
function mapLaporan(l) {
    if (!l)
        return l;
    return {
        ...l,
        tower: l.tower ? { ...l.tower, nomorTower: l.tower.id } : null,
        latestProgressTipe: l.progress?.[0]?.tipe ?? null,
    };
}
let LaporanService = class LaporanService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    buildAccessWhere(currentUser) {
        if (currentUser?.role === 'teknisi') {
            return { pelaporId: currentUser.id };
        }
        return {};
    }
    async assertAccessible(id, currentUser) {
        const laporan = await this.prisma.laporan.findUnique({
            where: { id },
            select: { id: true, pelaporId: true, towerId: true },
        });
        if (!laporan)
            throw new common_1.NotFoundException(`Laporan ${id} tidak ditemukan`);
        if (currentUser?.role === 'teknisi' && laporan.pelaporId !== currentUser.id) {
            throw new common_1.ForbiddenException('Anda tidak memiliki akses ke laporan ini');
        }
        return laporan;
    }
    async findAll(query, currentUser) {
        const page = Math.max(1, Number(query.page ?? 1));
        const limit = Math.min(100, Math.max(1, Number(query.limit ?? 10)));
        const skip = (page - 1) * limit;
        const where = this.buildAccessWhere(currentUser);
        if (query.jenisGangguan) {
            const vals = query.jenisGangguan.split(',').filter(Boolean);
            if (vals.length > 0)
                where.jenisGangguan = { in: vals };
        }
        if (query.status) {
            const vals = query.status.split(',').filter(Boolean);
            if (vals.length > 0)
                where.status = { in: vals };
        }
        if (query.levelRisiko) {
            const vals = query.levelRisiko.split(',').filter(Boolean);
            if (vals.length > 0) {
                const expanded = vals.flatMap(v => v === 'kritis' ? ['kritis', 'kritis_terpenuhi', 'kritis_tidak_terpenuhi'] : [v]);
                where.levelRisiko = { in: expanded };
            }
        }
        if (query.towerId) {
            const vals = query.towerId.split(',').filter(Boolean);
            if (vals.length > 0)
                where.towerId = { in: vals };
        }
        if (query.jalur) {
            const vals = query.jalur.split(',').map(s => s.trim()).filter(Boolean);
            if (vals.length > 0) {
                where.tower = { ...(where.tower ?? {}), jalur: { in: vals } };
            }
        }
        if (query.teknisi) {
            const vals = query.teknisi.split(',').filter(Boolean);
            if (vals.length > 0) {
                where.OR = [
                    ...(where.OR || []),
                    { teknisi: { in: vals } },
                    { pelapor: { nama: { in: vals } } }
                ];
            }
        }
        if (query.tglMulai || query.tglAkhir) {
            where.tanggal = {};
            if (query.tglMulai)
                where.tanggal.gte = new Date(`${query.tglMulai}T00:00:00+07:00`);
            if (query.tglAkhir)
                where.tanggal.lte = new Date(`${query.tglAkhir}T23:59:59.999+07:00`);
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
                include: INCLUDE_LIST,
                orderBy: { tanggal: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.laporan.count({ where }),
        ]);
        return { data: data.map(mapLaporan), total, page, limit };
    }
    async findOne(id, currentUser) {
        await this.assertAccessible(id, currentUser);
        const laporan = await this.prisma.laporan.findFirst({
            where: { id, ...this.buildAccessWhere(currentUser) },
            include: INCLUDE_FULL,
        });
        if (!laporan)
            throw new common_1.NotFoundException(`Laporan ${id} tidak ditemukan`);
        return mapLaporan(laporan);
    }
    async getStats(currentUser) {
        const where = this.buildAccessWhere(currentUser);
        const counts = await this.prisma.laporan.groupBy({
            by: ['jenisGangguan'],
            where,
            _count: { id: true },
        });
        const result = {
            ppl: 0, kebakaran: 0, layangan: 0, pencurian: 0,
            pemanfaatan: 0, gangguan: 0, cui: 0, cleanup: 0,
        };
        const KEY_ALIAS = {
            pekerjaan_pihak_lain: 'ppl',
            pemanfaatan_lahan: 'pemanfaatan',
        };
        for (const c of counts) {
            const key = KEY_ALIAS[c.jenisGangguan] ?? c.jenisGangguan;
            result[key] = c._count.id;
        }
        const [total, berlangsung] = await Promise.all([
            this.prisma.laporan.count({ where }),
            this.prisma.laporan.count({ where: { ...where, status: 'berlangsung' } }),
        ]);
        return { ...result, total, berlangsung };
    }
    async syncTowerStatus(towerId) {
        const active = await this.prisma.laporan.findMany({
            where: { towerId, status: 'berlangsung' },
            select: { levelRisiko: true, jenisGangguan: true },
        });
        if (active.length === 0) {
            await this.prisma.tower.update({
                where: { id: towerId },
                data: { statusKerawanan: 'aman', jenisKerawanan: null },
            });
            return;
        }
        let worstLevel = 'aman';
        let worstPriority = 0;
        let worstJenis = null;
        for (const l of active) {
            const p = LEVEL_PRIORITY[l.levelRisiko] ?? 1;
            if (p > worstPriority) {
                worstPriority = p;
                worstLevel = l.levelRisiko;
                worstJenis = KERAWANAN_TYPES.has(l.jenisGangguan) ? l.jenisGangguan : worstJenis;
            }
        }
        await this.prisma.tower.update({
            where: { id: towerId },
            data: { statusKerawanan: worstLevel, jenisKerawanan: worstJenis },
        });
    }
    async create(dto, pelaporId) {
        const { towerId, tanggal, foto = [], ...rest } = dto;
        const tower = await this.prisma.tower.findUnique({ where: { id: towerId } });
        if (!tower)
            throw new common_1.NotFoundException(`Tower dengan id "${towerId}" tidak ditemukan`);
        const result = await this.prisma.$transaction(async (tx) => {
            const created = await tx.laporan.create({
                data: {
                    ...rest,
                    tanggal: new Date(tanggal),
                    foto,
                    tower: { connect: { id: towerId } },
                    pelapor: { connect: { id: pelaporId } },
                },
                include: INCLUDE_FULL,
            });
            await tx.riwayatLaporan.create({
                data: {
                    laporanId: created.id,
                    oleh: created.pelapor?.nama ?? 'Sistem',
                    tanggal: created.createdAt,
                    statusKerawanan: created.levelRisiko,
                    progresLaporan: created.progresLaporan ?? 'sedang_berlangsung',
                    uraianPekerjaan: created.deskripsi ?? null,
                    upayaPengendalian: created.keterangan ?? null,
                    pihakLain: created.teknisi ?? null,
                    contactPerson: created.contactPerson ?? null,
                    foto: created.foto ?? [],
                    beritaAcara: [],
                    spanduk: [],
                    surat: [],
                    changedFields: INITIAL_RIWAYAT_FIELDS,
                },
            });
            return created;
        });
        await this.syncTowerStatus(towerId);
        return mapLaporan(result);
    }
    async update(id, dto, currentUser) {
        const existing = await this.assertAccessible(id, currentUser);
        const { towerId, tanggal, pelaporId: _, ...rest } = dto;
        const result = await this.prisma.laporan.update({
            where: { id },
            data: {
                ...rest,
                ...(tanggal && { tanggal: new Date(tanggal) }),
                ...(towerId && { tower: { connect: { id: towerId } } }),
            },
            include: INCLUDE_FULL,
        });
        await this.syncTowerStatus(towerId ?? existing.towerId);
        if (towerId && towerId !== existing.towerId) {
            await this.syncTowerStatus(existing.towerId);
        }
        return mapLaporan(result);
    }
    async remove(id, currentUser) {
        const existing = await this.assertAccessible(id, currentUser);
        await this.prisma.laporan.delete({ where: { id } });
        await this.syncTowerStatus(existing.towerId);
    }
    async updateFotoUrls(id, urls, currentUser) {
        await this.assertAccessible(id, currentUser);
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