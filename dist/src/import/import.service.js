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
    async generateTowerTemplate() {
        const wb = XLSX.utils.book_new();
        const towers = await this.prisma.tower.findMany({
            orderBy: [{ jalur: 'asc' }, { nomorUrut: 'asc' }, { id: 'asc' }],
        });
        const headers = ['id', 'nama', 'lat', 'lng', 'tegangan', 'tipe', 'kondisi', 'lokasi', 'jalur', 'nomorUrut'];
        const rows = towers.map(t => [
            t.id, t.nama, t.lat, t.lng, t.tegangan ?? '', t.tipe ?? '',
            t.kondisi ?? 'normal', t.lokasi ?? '', t.jalur ?? '', t.nomorUrut ?? '',
        ]);
        const ws1 = XLSX.utils.aoa_to_sheet([headers, ...rows]);
        ws1['!cols'] = [14, 36, 12, 12, 10, 12, 12, 36, 40, 12].map(w => ({ wch: w }));
        XLSX.utils.book_append_sheet(wb, ws1, 'Template');
        const panduan = [
            ['PANDUAN PENGISIAN TEMPLATE IMPORT DATA ASET TRANSMISI'],
            [],
            ['Kolom', 'Nama Kolom', 'Wajib?', 'Tipe Data', 'Penjelasan Lengkap', 'Nilai yang Valid', 'Contoh'],
            [
                'A', 'id', 'WAJIB', 'Teks',
                'ID unik tower sebagai kode identifikasi di sistem. Jika ID sudah ada di database, data tower akan di-UPDATE (bukan duplikat). Jika belum ada, data akan dibuat baru.',
                'Bebas, tidak boleh duplikat',
                'T-DKS-001',
            ],
            [
                'B', 'nama', 'WAJIB', 'Teks',
                'Nama lengkap tower transmisi. Biasanya mencantumkan nomor urut dan nama ruas jalur.',
                'Teks bebas',
                'Tower 1 Durikosambi–Kembangan',
            ],
            [
                'C', 'lat', 'WAJIB', 'Angka desimal',
                'Koordinat Latitude (garis lintang) dalam sistem WGS84 (standar GPS). Untuk wilayah Indonesia, nilainya negatif karena berada di belahan bumi selatan. Gunakan titik (.) sebagai pemisah desimal, BUKAN koma.',
                'Angka desimal, misal: -6.1523',
                '-6.1523',
            ],
            [
                'D', 'lng', 'WAJIB', 'Angka desimal',
                'Koordinat Longitude (garis bujur) dalam sistem WGS84. Untuk wilayah Indonesia berkisar antara 95 sampai 141. Gunakan titik (.) sebagai pemisah desimal, BUKAN koma.',
                'Angka desimal, misal: 106.7041',
                '106.7041',
            ],
            [
                'E', 'tegangan', 'WAJIB', 'Teks',
                'Tegangan operasi jaringan transmisi. Isi sesuai rating tegangan tower.',
                '500kV / 150kV / 70kV / 20kV',
                '500kV',
            ],
            [
                'F', 'tipe', 'WAJIB', 'Teks',
                'Tipe/klasifikasi tower. Harus diisi salah satu dari nilai yang valid persis seperti ditulis (case-sensitive).\n• SUTET = Saluran Udara Tegangan Ekstra Tinggi (500kV)\n• SUTT  = Saluran Udara Tegangan Tinggi (150kV/70kV)\n• SKTT  = Saluran Kabel Tegangan Tinggi (bawah tanah)\n• garduInduk = Gardu Induk (substation)',
                'SUTET | SUTT | SKTT | garduInduk',
                'SUTET',
            ],
            [
                'G', 'kondisi', 'Opsional', 'Teks',
                'Kondisi operasional tower saat ini. Jika dikosongkan, sistem otomatis mengisi "normal".\n• normal      = Tower beroperasi normal\n• waspada     = Ada potensi gangguan, perlu pemantauan\n• gangguan    = Tower sedang mengalami gangguan\n• maintenance = Tower sedang dalam pemeliharaan',
                'normal | waspada | gangguan | maintenance',
                'normal',
            ],
            [
                'H', 'lokasi', 'Opsional', 'Teks',
                'Deskripsi lokasi administratif tower (kelurahan, kecamatan, kota/kabupaten). Digunakan untuk keperluan referensi dan pencarian.',
                'Teks bebas',
                'Kel. Rawa Buaya, Cengkareng, Jakarta Barat',
            ],
            [
                'I', 'jalur', 'Opsional*', 'Teks',
                '(*) Wajib diisi jika ingin polyline jalur tampil di peta secara otomatis.\nNama jalur transmisi tempat tower ini berada. Tower dengan nama jalur yang sama akan disambungkan sebagai garis di peta (polyline), diurutkan berdasarkan kolom nomorUrut.\nGunakan nama yang KONSISTEN untuk satu jalur (sama persis antar baris).',
                'Teks bebas, harus konsisten per jalur',
                'SUTET 500kV DURIKOSAMBI-KEMBANGAN',
            ],
            [
                'J', 'nomorUrut', 'Opsional*', 'Angka bulat',
                '(*) Wajib diisi jika kolom jalur diisi.\nNomor urut posisi tower dalam jalur transmisi, dihitung dari ujung ke ujung jalur. Digunakan untuk menentukan urutan sambungan polyline di peta. Isi dengan angka bulat positif mulai dari 1.',
                'Angka bulat: 1, 2, 3, ...',
                '1',
            ],
            [],
            ['CATATAN PENTING:'],
            ['1. Baris kosong akan diabaikan secara otomatis.'],
            ['2. Baris pertama (header) tidak boleh diubah.'],
            ['3. Jika kolom id sudah ada di database → data di-UPDATE. Jika belum ada → data DIBUAT BARU.'],
            ['4. Kolom jalur dan nomorUrut bersifat opsional, tetapi KEDUANYA harus diisi agar polyline peta bekerja.'],
            ['5. Koordinat lat/lng: gunakan titik (.) sebagai pemisah desimal, bukan koma.'],
            ['6. Nilai kolom tipe harus PERSIS seperti yang tertulis di kolom "Nilai yang Valid" (perhatikan huruf besar/kecil).'],
            ['7. Untuk kolom kondisi, jika dikosongkan sistem akan mengisi "normal" secara otomatis.'],
        ];
        const ws2 = XLSX.utils.aoa_to_sheet(panduan);
        ws2['!cols'] = [6, 14, 10, 16, 70, 36, 36].map(w => ({ wch: w }));
        ws2['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }];
        XLSX.utils.book_append_sheet(wb, ws2, 'Panduan');
        const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
        return Buffer.from(buf);
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
                jalur: row.jalur || row.Jalur || null,
                nomorUrut: row.nomorUrut ? Number(row.nomorUrut) : null,
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
            const rawRuas = String(r['RUAS'] || '').trim();
            const rawSpan = String(r['SPAN'] || r['NO. TOWER'] || '').trim();
            let rawPelapor = String(r.pelaporId || r['PETUGAS LW'] || 'Teknisi Default').trim() || 'Teknisi Default';
            const rawJenis = String(r.jenisGangguan || r.kategori || r['KLASIFIKASI '] || r['KLASIFIKASI'] || '');
            const jenisGangguan = this.normalizeJenis(rawJenis);
            const deskripsi = String(r.deskripsi || r['URAIAN PEKERJAAN'] || jenisGangguan);
            const keterangan = [
                r['PENGENDALIAN'] || r.keterangan || '',
                r['PIHAK LAIN'] ? `Pihak Lain: ${r['PIHAK LAIN']}` : '',
            ].filter(Boolean).join('\n');
            const rawStatus = String(r.status || r['STATUS'] || '');
            const statusStr = this.normalizeStatus(rawStatus);
            const levelRisiko = String(r.levelRisiko || r.level || 'aman');
            const tanggal = r.tanggal ? new Date(r.tanggal) : new Date();
            let tower = rawRuas
                ? await this.prisma.tower.findFirst({
                    where: { jalur: { contains: rawRuas, mode: 'insensitive' } },
                    orderBy: { nomorUrut: 'asc' },
                })
                : null;
            if (!tower) {
                const placeholderId = `RUAS-${rawRuas.replace(/\s+/g, '-').toUpperCase().slice(0, 40)}`;
                tower = await this.prisma.tower.findUnique({ where: { id: placeholderId } });
                if (!tower) {
                    tower = await this.prisma.tower.create({
                        data: {
                            id: placeholderId,
                            nama: rawRuas || 'Ruas Tidak Dikenal',
                            lat: 0, lng: 0,
                            tegangan: '150 kV',
                            tipe: 'other',
                            jalur: rawRuas || null,
                        },
                    });
                }
            }
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
                    },
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