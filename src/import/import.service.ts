import { Injectable, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import * as XLSX from 'xlsx'

@Injectable()
export class ImportService {
  constructor(private prisma: PrismaService) {}

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
        nama:     String(row.nama     || row.Nama     || ''),
        lat:      Number(row.lat      || row.Lat      || 0),
        lng:      Number(row.lng      || row.Lng      || 0),
        tegangan: String(row.tegangan || row.Tegangan || ''),
        tipe:     String(row.tipe     || row.Tipe     || ''),
        kondisi:  String(row.kondisi  || row.Kondisi  || 'normal'),
        lokasi:   row.lokasi || row.Lokasi || null,
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
      .filter(r => r.towerId || r.tower_id)
      .map(r => ({
        towerId:      String(r.towerId || r.tower_id),
        tipe:         String(r.tipe    || r.Tipe || ''),
        nama:         String(r.nama    || r.Nama || ''),
        berlakuHingga: new Date(r.berlakuHingga || r.berlaku_hingga),
        status:       String(r.status  || r.Status || 'valid'),
      }))

    await this.prisma.sertifikat.createMany({ data, skipDuplicates: true })
    return { message: 'Import sertifikat selesai', total: data.length }
  }

  private async importLaporan(rows: any[]) {
    let createdCount = 0

    // Filter valid rows: Abaikan baris instruksi/header (yg isinya 'Input manual', dsb)
    const validRows = rows.filter(r => {
      const isInstruction = 
        r['RUAS'] === 'Otomatis by foto lokasi' || 
        r['URAIAN PEKERJAAN'] === 'Input manual' ||
        String(r['NO']).toLowerCase().includes('no')
      
      const hasContent = r.towerId || r['NO. TOWER'] || r['SPAN'] || r['URAIAN PEKERJAAN']
      return !isInstruction && hasContent
    })

    console.log(`[Import] Total rows: ${rows.length}, Valid rows: ${validRows.length}`)

    for (const r of validRows) {
      let rawTowerId = String(r.towerId || r['NO. TOWER'] || r['SPAN'] || 'UNKNOWN-TOWER')
      let rawPelapor = String(r.pelaporId || r['PETUGAS LW'] || 'Teknisi Default')
      
      let jenisGangguan = String(r.jenisGangguan || r.kategori || r['KLASIFIKASI '] || r['KLASIFIKASI'] || 'Pekerjaan Pihak Lain').trim()
      
      const deskripsi   = String(r.deskripsi || r['URAIAN PEKERJAAN'] || '')
      const keterangan  = (r.keterangan || r['PENGENDALIAN'] || '') + (r['PIHAK LAIN'] ? `\nPihak Lain: ${r['PIHAK LAIN']}` : '')
      
      let statusStr = String(r.status || r['STATUS'] || 'Sedang Berlangsung').trim()
      
      const levelRisiko = String(r.levelRisiko || r.level || 'rendah')
      const tanggal = r.tanggal ? new Date(r.tanggal) : new Date()

      rawPelapor = rawPelapor.trim()
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

    return { message: 'Import laporan selesai', total: createdCount }
  }
}
