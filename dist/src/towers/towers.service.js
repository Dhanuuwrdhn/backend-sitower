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
exports.TowersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TowersService = class TowersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const page = Math.max(1, Number(query?.page ?? 1));
        const limit = Math.min(200, Math.max(1, Number(query?.limit ?? 50)));
        const skip = (page - 1) * limit;
        const where = {};
        if (query?.tipe)
            where.tipe = query.tipe;
        if (query?.kondisi)
            where.kondisi = query.kondisi;
        if (query?.search) {
            where.OR = [
                { id: { contains: query.search, mode: 'insensitive' } },
                { nama: { contains: query.search, mode: 'insensitive' } },
                { lokasi: { contains: query.search, mode: 'insensitive' } },
            ];
        }
        const [data, total] = await Promise.all([
            this.prisma.tower.findMany({ where, orderBy: { id: 'asc' }, skip, take: limit }),
            this.prisma.tower.count({ where }),
        ]);
        return { data, total, page, limit };
    }
    async findAllForMap() {
        const towers = await this.prisma.tower.findMany({
            where: { lat: { not: 0 }, lng: { not: 0 } },
            include: {
                laporan: {
                    where: { status: { notIn: ['selesai'] } },
                    select: { jenisGangguan: true, levelRisiko: true, status: true },
                    orderBy: { tanggal: 'desc' },
                },
            },
            orderBy: { id: 'asc' },
        });
        return towers.map((t) => ({
            id: t.id,
            nama: t.nama,
            lat: t.lat,
            lng: t.lng,
            tipe: t.tipe,
            tegangan: t.tegangan,
            updatedAt: t.updatedAt.toISOString(),
            kerawanan: t.laporan.map((l) => ({
                kategori: l.jenisGangguan,
                level: l.levelRisiko,
                status: l.status,
            })),
        }));
    }
    async findAllForDropdown() {
        const towers = await this.prisma.tower.findMany({
            select: { id: true, nama: true, tipe: true, tegangan: true, lat: true, lng: true },
            orderBy: { id: 'asc' },
        });
        return towers.map((t) => ({
            id: t.id,
            nomorTower: t.id,
            garduInduk: '',
            tipe: t.tipe,
            tegangan: t.tegangan,
            nama: t.nama,
            lat: t.lat,
            lng: t.lng,
        }));
    }
    async findOne(id) {
        const tower = await this.prisma.tower.findUnique({
            where: { id },
            include: {
                laporan: {
                    include: { pelapor: { select: { id: true, nama: true, jabatan: true } } },
                    orderBy: { tanggal: 'desc' },
                },
                sertifikat: { orderBy: { berlakuHingga: 'asc' } },
                asBuilt: { orderBy: { tahun: 'desc' } },
            },
        });
        if (!tower)
            throw new common_1.NotFoundException(`Tower ${id} tidak ditemukan`);
        return tower;
    }
    create(dto) {
        return this.prisma.tower.create({ data: dto });
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.tower.update({ where: { id }, data: dto });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.tower.delete({ where: { id } });
    }
};
exports.TowersService = TowersService;
exports.TowersService = TowersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TowersService);
//# sourceMappingURL=towers.service.js.map