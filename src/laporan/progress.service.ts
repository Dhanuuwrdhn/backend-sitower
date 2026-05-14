import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class ProgressService {
  constructor(private prisma: PrismaService) {}

  async addProgress(laporanId: string, tipe: string, fileUrl: string, namaFile: string) {
    const laporan = await this.prisma.laporan.findUnique({ where: { id: laporanId } })
    if (!laporan) throw new NotFoundException(`Laporan ${laporanId} tidak ditemukan`)

    return this.prisma.progressLaporan.create({
      data: { laporanId, tipe, fileUrl, namaFile },
    })
  }

  async getProgress(laporanId: string) {
    const rows = await this.prisma.progressLaporan.findMany({
      where:   { laporanId },
      orderBy: { createdAt: 'desc' },
    })

    // Group by tipe
    const grouped: Record<string, typeof rows> = {
      spanduk: [], brosur: [], laporan_baru: [], berita_acara: [],
    }
    for (const r of rows) {
      if (grouped[r.tipe]) grouped[r.tipe].push(r)
      else grouped[r.tipe] = [r]
    }
    return grouped
  }

  async deleteProgress(laporanId: string, progressId: string) {
    const rec = await this.prisma.progressLaporan.findFirst({
      where: { id: progressId, laporanId },
    })
    if (!rec) throw new NotFoundException('Progress tidak ditemukan')
    return this.prisma.progressLaporan.delete({ where: { id: progressId } })
  }

  async getLatestProgress(laporanId: string) {
    return this.prisma.progressLaporan.findFirst({
      where:   { laporanId },
      orderBy: { createdAt: 'desc' },
      select:  { tipe: true, createdAt: true },
    })
  }

  // Foto history
  async addFotoHistory(laporanId: string, urls: string[]) {
    const laporan = await this.prisma.laporan.findUnique({ where: { id: laporanId } })
    if (!laporan) throw new NotFoundException(`Laporan ${laporanId} tidak ditemukan`)
    return this.prisma.fotoHistory.create({ data: { laporanId, urls } })
  }

  async getFotoHistory(laporanId: string) {
    return this.prisma.fotoHistory.findMany({
      where:   { laporanId },
      orderBy: { createdAt: 'desc' },
    })
  }

  // ── Riwayat Pembaruan Laporan ──────────────────────────────────────────
  async getRiwayat(laporanId: string) {
    return this.prisma.riwayatLaporan.findMany({
      where:   { laporanId },
      orderBy: { tanggal: 'desc' },
    })
  }

  async addRiwayat(
    laporanId: string,
    oleh: string,
    payload: {
      statusKerawanan: string
      progresLaporan: string
      uraianPekerjaan?: string
      upayaPengendalian?: string
      pihakLain?: string
      contactPerson?: string
      foto?: string[]
      beritaAcara?: string[]
      spanduk?: string[]
      surat?: string[]
    },
  ) {
    const laporan = await this.prisma.laporan.findUnique({ where: { id: laporanId } })
    if (!laporan) throw new NotFoundException(`Laporan ${laporanId} tidak ditemukan`)

    const riwayat = await this.prisma.riwayatLaporan.create({
      data: {
        laporanId,
        oleh,
        statusKerawanan: payload.statusKerawanan,
        progresLaporan:  payload.progresLaporan,
        uraianPekerjaan: payload.uraianPekerjaan ?? null,
        upayaPengendalian: payload.upayaPengendalian ?? null,
        pihakLain:       payload.pihakLain ?? null,
        contactPerson:   payload.contactPerson ?? null,
        foto:            payload.foto ?? [],
        beritaAcara:     payload.beritaAcara ?? [],
        spanduk:         payload.spanduk ?? [],
        surat:           payload.surat ?? [],
      },
    })

    // Sync laporan parent: status, progres, levelRisiko reflect latest update
    const status =
      payload.progresLaporan === 'selesai' ? 'selesai' :
      payload.progresLaporan === 'tidak_ada_aktifitas' ? 'tidak_ada_aktifitas' :
      'berlangsung'
    await this.prisma.laporan.update({
      where: { id: laporanId },
      data: {
        status,
        progresLaporan: payload.progresLaporan,
        levelRisiko:    payload.statusKerawanan,
      },
    })

    return riwayat
  }

  async deleteRiwayat(laporanId: string, riwayatId: string) {
    const rec = await this.prisma.riwayatLaporan.findFirst({
      where: { id: riwayatId, laporanId },
    })
    if (!rec) throw new NotFoundException('Riwayat tidak ditemukan')
    return this.prisma.riwayatLaporan.delete({ where: { id: riwayatId } })
  }
}
