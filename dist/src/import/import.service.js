"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const XLSX = __importStar(require("xlsx"));
let ImportService = class ImportService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async importFile(type, buffer) {
        const wb = XLSX.read(buffer, { type: 'buffer', cellDates: true });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet);
        if (!rows.length)
            throw new common_1.BadRequestException('File Excel kosong');
        switch (type) {
            case 'towers': return this.importTowers(rows);
            case 'sertifikat': return this.importSertifikat(rows);
            case 'laporan': return this.importLaporan(rows);
            default:
                throw new common_1.BadRequestException(`Tipe import tidak dikenal: ${type}`);
        }
    }
    async importTowers(rows) {
        let created = 0;
        let updated = 0;
        for (const row of rows) {
            const data = {
                nama: String(row.nama || row.Nama || ''),
                lat: Number(row.lat || row.Lat || 0),
                lng: Number(row.lng || row.Lng || 0),
                tegangan: String(row.tegangan || row.Tegangan || ''),
                tipe: String(row.tipe || row.Tipe || ''),
                kondisi: String(row.kondisi || row.Kondisi || 'normal'),
                lokasi: row.lokasi || row.Lokasi || null,
            };
            const id = String(row.id || row.ID || '');
            if (!id)
                continue;
            const exists = await this.prisma.tower.findUnique({ where: { id } });
            if (exists) {
                await this.prisma.tower.update({ where: { id }, data });
                updated++;
            }
            else {
                await this.prisma.tower.create({ data: { id, ...data } });
                created++;
            }
        }
        return { message: 'Import towers selesai', created, updated, total: rows.length };
    }
    async importSertifikat(rows) {
        const data = rows
            .filter(r => r.nama || r.Nama)
            .map(r => ({
            towerId: r.towerId || r.tower_id ? String(r.towerId || r.tower_id) : undefined,
            kategori: String(r.kategori || r.tipe || r.Tipe || r.Kategori || ''),
            nama: String(r.nama || r.Nama || ''),
            berlakuHingga: r.berlakuHingga || r.berlaku_hingga ? new Date(r.berlakuHingga || r.berlaku_hingga) : undefined,
            status: String(r.status || r.Status || 'berlaku'),
        }));
        await this.prisma.sertifikat.createMany({ data, skipDuplicates: true });
        return { message: 'Import sertifikat selesai', total: data.length };
    }
    normalizeStatus(raw) {
        const s = (raw || '').trim().toLowerCase();
        if (!s)
            return 'tidak_ada_aktifitas';
        if (s.includes('berlangsung') || s.includes('ongoing'))
            return 'berlangsung';
        if (s.includes('selesai') || s.includes('done') || s.includes('complete'))
            return 'selesai';
        if (s.includes('tidak ada') || s.includes('tidak aktif') || s === 'inactive')
            return 'tidak_ada_aktifitas';
        const known = ['berlangsung', 'selesai', 'tidak_ada_aktifitas'];
        if (known.includes(s))
            return s;
        return 'tidak_ada_aktifitas';
    }
    normalizeJenis(raw) {
        const s = (raw || '').trim().toLowerCase();
        if (s.includes('pihak lain') || s.includes('ppl'))
            return 'pekerjaan_pihak_lain';
        if (s.includes('kebakaran') || s.includes('fire'))
            return 'kebakaran';
        if (s.includes('layangan') || s.includes('layang'))
            return 'layangan';
        if (s.includes('pencurian') || s.includes('theft'))
            return 'pencurian';
        if (s.includes('pemanfaatan') || s.includes('lahan'))
            return 'pemanfaatan_lahan';
        return 'pekerjaan_pihak_lain';
    }
    async importLaporan(rows) {
        let createdCount = 0;
        const validRows = rows.filter(r => {
            const isInstruction = r['RUAS'] === 'Otomatis by foto lokasi' ||
                r['URAIAN PEKERJAAN'] === 'Input manual' ||
                String(r['NO']).toLowerCase() === 'no';
            const hasContent = r['SPAN'] || r['NO. TOWER'] || r['RUAS'] ||
                r['KLASIFIKASI '] || r['KLASIFIKASI'] ||
                r['URAIAN PEKERJAAN'];
            return !isInstruction && !!hasContent;
        });
        console.log(`[Import] Total rows: ${rows.length}, Valid rows: ${validRows.length}`);
        for (const r of validRows) {
            let rawTowerId = String(r.towerId || r['NO. TOWER'] || r['SPAN'] || 'UNKNOWN-TOWER');
            let rawPelapor = String(r.pelaporId || r['PETUGAS LW'] || 'Teknisi Default');
            const rawJenis = String(r.jenisGangguan || r.kategori || r['KLASIFIKASI '] || r['KLASIFIKASI'] || '');
            const jenisGangguan = this.normalizeJenis(rawJenis);
            const deskripsi = String(r.deskripsi || r['URAIAN PEKERJAAN'] || jenisGangguan);
            const keterangan = [
                r['PENGENDALIAN'] || r.keterangan || '',
                r['PIHAK LAIN'] ? `Pihak Lain: ${r['PIHAK LAIN']}` : '',
            ].filter(Boolean).join('\n');
            const rawStatus = String(r.status || r['STATUS'] || '');
            const statusStr = this.normalizeStatus(rawStatus);
            const levelRisiko = String(r.levelRisiko || r.level || 'rendah');
            const tanggal = r.tanggal ? new Date(r.tanggal) : new Date();
            rawPelapor = rawPelapor.trim() || 'Teknisi Default';
            let pegawai = await this.prisma.pegawai.findFirst({ where: { nama: rawPelapor } });
            if (!pegawai) {
                pegawai = await this.prisma.pegawai.create({
                    data: {
                        nik: 'NIK-' + Date.now() + Math.floor(Math.random() * 1000),
                        nama: rawPelapor,
                        jabatan: 'Petugas Lapangan',
                        unit: 'ULTG',
                        role: 'teknisi',
                        password: 'password123',
                    }
                });
            }
            rawTowerId = rawTowerId.trim();
            let tower = await this.prisma.tower.findUnique({ where: { id: rawTowerId } });
            if (!tower) {
                const ruas = r['RUAS'] ? ` (${r['RUAS']})` : '';
                tower = await this.prisma.tower.create({
                    data: {
                        id: rawTowerId,
                        nama: `Tower/Span ${rawTowerId}${ruas}`,
                        lat: 0,
                        lng: 0,
                        tegangan: '150 kV',
                        tipe: 'other',
                    }
                });
            }
            const existingLaporan = await this.prisma.laporan.findFirst({
                where: {
                    towerId: tower.id,
                    jenisGangguan: jenisGangguan,
                    deskripsi: deskripsi,
                }
            });
            if (!existingLaporan) {
                await this.prisma.laporan.create({
                    data: {
                        towerId: tower.id,
                        pelaporId: pegawai.id,
                        jenisGangguan: jenisGangguan,
                        deskripsi: deskripsi,
                        levelRisiko: levelRisiko,
                        status: statusStr,
                        tanggal: tanggal,
                        lokasiDetail: r.lokasiDetail || r.lokasi || r['RUAS'] || null,
                        keterangan: keterangan,
                        foto: r.foto ? String(r.foto).split(',').map((s) => s.trim()) : [],
                    }
                });
                createdCount++;
            }
        }
        return { message: 'Import laporan selesai', total: createdCount };
    }
};
exports.ImportService = ImportService;
exports.ImportService = ImportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ImportService);
//# sourceMappingURL=import.service.js.map