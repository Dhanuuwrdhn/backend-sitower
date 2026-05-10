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
      ['Kolom', 'Wajib?', 'Tipe', 'Keterangan', 'Contoh Nilai'],
      ['id',        'Ya',  'Teks', 'ID unik tower. Akan di-update jika sudah ada.', 'T-DKS-001'],
      ['nama',      'Ya',  'Teks', 'Nama lengkap tower.',                            'Tower 1 Durikosambi–Kembangan'],
      ['lat',       'Ya',  'Angka desimal', 'Latitude (WGS84). Negatif untuk lintang selatan.', '-6.1523'],
      ['lng',       'Ya',  'Angka desimal', 'Longitude (WGS84).',                    '106.7041'],
      ['tegangan',  'Ya',  'Teks', 'Tegangan operasi tower.',                        '500kV / 150kV / 70kV'],
      ['tipe',      'Ya',  'Teks', 'Tipe tower. Pilih salah satu nilai valid.',      'SUTET | SUTT | SKTT | garduInduk'],
      ['kondisi',   'Tidak', 'Teks', 'Kondisi tower saat ini. Default: normal.',      'normal | waspada | gangguan | maintenance'],
      ['lokasi',    'Tidak', 'Teks', 'Deskripsi lokasi administratif.',               'Kel. Rawa Buaya, Cengkareng'],
      ['jalur',     'Tidak', 'Teks', 'Nama jalur transmisi. Digunakan untuk polyline otomatis di peta.', 'SUTET 500kV DURIKOSAMBI-KEMBANGAN'],
      ['nomorUrut', 'Tidak', 'Angka bulat', 'Urutan tower dalam jalur (ascending). Digunakan untuk sorting polyline.', '1, 2, 3, ...'],
      [],
      ['Catatan:'],
      ['- Baris kosong akan diabaikan.'],
      ['- Jika id sudah ada di database, data tower akan di-update (bukan duplikat).'],
      ['- Kolom jalur + nomorUrut opsional, tapi wajib diisi jika ingin polyline otomatis tampil di peta.'],
      ['- Format koordinat: gunakan titik (.) sebagai pemisah desimal, bukan koma.'],
    ]
    const ws2 = XLSX.utils.aoa_to_sheet(panduan)
    ws2['!cols'] = [14, 10, 16, 60, 36].map(w => ({ wch: w }))
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
