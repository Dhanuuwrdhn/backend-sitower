import { Injectable, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import * as XLSX from 'xlsx'

@Injectable()
export class ImportService {
  constructor(private prisma: PrismaService) {}

  async generateTowerTemplate(): Promise<Buffer> {
    const wb = XLSX.utils.book_new()

    // ── Sheet 1: Template ──────────────────────────────────────────────────────
    const headers = ['id', 'nama', 'lat', 'lng', 'tegangan', 'tipe', 'kondisi', 'lokasi', 'jalur', 'nomorUrut']
    const examples = [
      ['T-DKS-001', 'Tower 1 Durikosambi–Kembangan', -6.1523, 106.7041, '500kV', 'SUTET', 'normal', 'Kel. Rawa Buaya, Cengkareng, Jakarta Barat', 'SUTET 500kV DURIKOSAMBI-KEMBANGAN', 1],
      ['T-DKS-002', 'Tower 2 Durikosambi–Kembangan', -6.1598, 106.7105, '500kV', 'SUTET', 'waspada', 'Kel. Kapuk, Cengkareng, Jakarta Barat', 'SUTET 500kV DURIKOSAMBI-KEMBANGAN', 2],
      ['T-JTK-015', 'Tower 15 Jatake–Tangerang', -6.2234, 106.6187, '150kV', 'SUTT', 'normal', 'Kel. Jatake, Jatiuwung, Kota Tangerang', 'SUTT 150kV JATAKE-TANGERANG', 15],
    ]
    const ws1 = XLSX.utils.aoa_to_sheet([headers, ...examples])
    // Set column widths
    ws1['!cols'] = [14, 36, 12, 12, 10, 12, 12, 36, 40, 12].map(w => ({ wch: w }))
    XLSX.utils.book_append_sheet(wb, ws1, 'Template')

    // ── Sheet 2: Panduan ───────────────────────────────────────────────────────
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
    ]
    const ws2 = XLSX.utils.aoa_to_sheet(panduan)
    ws2['!cols'] = [6, 14, 10, 16, 70, 36, 36].map(w => ({ wch: w }))
    ws2['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }]
    XLSX.utils.book_append_sheet(wb, ws2, 'Panduan')

    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
    return Buffer.from(buf)
  }

  async importFile(type: string, buffer: Buffer) {
    const wb = XLSX.read(buffer, { type: 'buffer', cellDates: true })
    const sheet = wb.Sheets[wb.SheetNames[0]]
    const rows: any[] = XLSX.utils.sheet_to_json(sheet)

    if (!rows.length) throw new BadRequestException('File Excel kosong')

    switch (type) {
      case 'towers':    return this.importTowers(rows)
      case 'sertifikat': return this.importSertifikat(rows)
      case 'laporan':   return this.importLaporan(rows)
      default:
        throw new BadRequestException(`Tipe import tidak dikenal: ${type}`)
    }
  }

  private async importTowers(rows: any[]) {
    let created = 0
    let updated = 0
    for (const row of rows) {
      const data = {
        nama:      String(row.nama     || row.Nama     || ''),
        lat:       Number(row.lat      || row.Lat      || 0),
        lng:       Number(row.lng      || row.Lng      || 0),
        tegangan:  String(row.tegangan || row.Tegangan || ''),
        tipe:      String(row.tipe     || row.Tipe     || ''),
        kondisi:   String(row.kondisi  || row.Kondisi  || 'normal'),
        lokasi:    row.lokasi    || row.Lokasi    || null,
        jalur:     row.jalur     || row.Jalur     || null,
        nomorUrut: row.nomorUrut ? Number(row.nomorUrut) : null,
      }
      const id = String(row.id || row.ID || '')
      if (!id) continue

      const exists = await this.prisma.tower.findUnique({ where: { id } })
      if (exists) {
        await this.prisma.tower.update({ where: { id }, data }); updated++
      } else {
        await this.prisma.tower.create({ data: { id, ...data } }); created++
      }
    }
    return { message: 'Import towers selesai', created, updated, total: rows.length }
  }

  private async importSertifikat(rows: any[]) {
    const data = rows
      .filter(r => r.nama || r.Nama)
      .map(r => ({
        towerId:       r.towerId || r.tower_id ? String(r.towerId || r.tower_id) : undefined,
        kategori:      String(r.kategori || r.tipe || r.Tipe || r.Kategori || ''),
        nama:          String(r.nama    || r.Nama || ''),
        berlakuHingga: r.berlakuHingga || r.berlaku_hingga ? new Date(r.berlakuHingga || r.berlaku_hingga) : undefined,
        status:        String(r.status  || r.Status || 'berlaku'),
      }))

    await this.prisma.sertifikat.createMany({ data, skipDuplicates: true })
    return { message: 'Import sertifikat selesai', total: data.length }
  }

  private normalizeStatus(raw: string): string {
    const s = (raw || '').trim().toLowerCase()
    if (!s) return 'tidak_ada_aktifitas' // kosong → belum ada aktifitas
    if (s.includes('berlangsung') || s.includes('ongoing')) return 'berlangsung'
    if (s.includes('selesai') || s.includes('done') || s.includes('complete')) return 'selesai'
    if (s.includes('tidak ada') || s.includes('tidak aktif') || s === 'inactive') return 'tidak_ada_aktifitas'
    
    // sudah lowercase & cocok langsung
    const known = ['berlangsung','selesai','tidak_ada_aktifitas']
    if (known.includes(s)) return s
    return 'tidak_ada_aktifitas'
  }
//test
  private normalizeJenis(raw: string): string {
    const s = (raw || '').trim().toLowerCase()
    if (s.includes('pihak lain') || s.includes('ppl')) return 'pekerjaan_pihak_lain'
    if (s.includes('kebakaran') || s.includes('fire'))  return 'kebakaran'
    if (s.includes('layangan') || s.includes('layang'))  return 'layangan'
    if (s.includes('pencurian') || s.includes('theft'))  return 'pencurian'
    if (s.includes('pemanfaatan') || s.includes('lahan')) return 'pemanfaatan_lahan'
    return 'pekerjaan_pihak_lain'
  }

  private async importLaporan(rows: any[]) {
    let createdCount = 0

    // Filter valid rows: abaikan baris instruksi/header
    const validRows = rows.filter(r => {
      const isInstruction =
        r['RUAS'] === 'Otomatis by foto lokasi' ||
        r['URAIAN PEKERJAAN'] === 'Input manual' ||
        String(r['NO']).toLowerCase() === 'no'

      // Terima jika ada SPAN, NO. TOWER, RUAS, KLASIFIKASI, atau URAIAN
      const hasContent =
        r['SPAN'] || r['NO. TOWER'] || r['RUAS'] ||
        r['KLASIFIKASI '] || r['KLASIFIKASI'] ||
        r['URAIAN PEKERJAAN']

      return !isInstruction && !!hasContent
    })

    console.log(`[Import] Total rows: ${rows.length}, Valid rows: ${validRows.length}`)

    for (const r of validRows) {
      let rawTowerId = String(r.towerId || r['NO. TOWER'] || r['SPAN'] || 'UNKNOWN-TOWER')
      let rawPelapor = String(r.pelaporId || r['PETUGAS LW'] || 'Teknisi Default')

      // Normalisasi jenis & status dari nilai Excel
      const rawJenis = String(r.jenisGangguan || r.kategori || r['KLASIFIKASI '] || r['KLASIFIKASI'] || '')
      const jenisGangguan = this.normalizeJenis(rawJenis)

      const deskripsi  = String(r.deskripsi || r['URAIAN PEKERJAAN'] || jenisGangguan)
      const keterangan = [
        r['PENGENDALIAN'] || r.keterangan || '',
        r['PIHAK LAIN'] ? `Pihak Lain: ${r['PIHAK LAIN']}` : '',
      ].filter(Boolean).join('\n')

      const rawStatus = String(r.status || r['STATUS'] || '')
      const statusStr = this.normalizeStatus(rawStatus)

      const levelRisiko = String(r.levelRisiko || r.level || 'aman')
      const tanggal = r.tanggal ? new Date(r.tanggal) : new Date()

      rawPelapor = rawPelapor.trim() || 'Teknisi Default'
      let pegawai = await this.prisma.pegawai.findFirst({ where: { nama: rawPelapor } })
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
        })
      }

      rawTowerId = rawTowerId.trim()
      let tower = await this.prisma.tower.findUnique({ where: { id: rawTowerId } })
      if (!tower) {
        const ruas = r['RUAS'] ? ` (${r['RUAS']})` : ''
        tower = await this.prisma.tower.create({
          data: {
            id: rawTowerId,
            nama: `Tower/Span ${rawTowerId}${ruas}`,
            lat: 0,
            lng: 0,
            tegangan: '150 kV',
            tipe: 'other',
          }
        })
      }

      // Cek apakah laporan serupa sudah ada (berdasarkan tower, jenis, dan deskripsi)
      const existingLaporan = await this.prisma.laporan.findFirst({
        where: {
          towerId: tower.id,
          jenisGangguan: jenisGangguan,
          deskripsi: deskripsi,
        }
      })

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
            foto: r.foto ? String(r.foto).split(',').map((s: string) => s.trim()) : [],
          }
        })
        createdCount++
      }
    }

    return { message: 'Import laporan selesai', total: createdCount }
  }
}
