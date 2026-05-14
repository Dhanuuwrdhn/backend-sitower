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
    const [laporan, progressRows] = await Promise.all([
      this.prisma.laporan.findUnique({ where: { id: laporanId } }),
      this.prisma.progressLaporan.findMany({
        where:   { laporanId },
        orderBy: { createdAt: 'desc' },
      }),
    ])
    if (!laporan) throw new NotFoundException(`Laporan ${laporanId} tidak ditemukan`)

    const currentProgress = progressRows.reduce<Record<string, string[]>>((acc, row) => {
      acc[row.tipe] = [...(acc[row.tipe] ?? []), row.fileUrl]
      return acc
    }, {})

    const status =
      payload.progresLaporan === 'selesai' ? 'selesai' :
      payload.progresLaporan === 'tidak_ada_aktifitas' ? 'tidak_ada_aktifitas' :
      'berlangsung'

    const nextFoto = payload.foto && payload.foto.length > 0 ? payload.foto : laporan.foto
    const nextDeskripsi = payload.uraianPekerjaan?.trim() ? payload.uraianPekerjaan.trim() : laporan.deskripsi
    const nextKeterangan = payload.upayaPengendalian?.trim() ? payload.upayaPengendalian.trim() : laporan.keterangan
    const nextTeknisi = payload.pihakLain?.trim() ? payload.pihakLain.trim() : laporan.teknisi
    const nextContactPerson = payload.contactPerson?.trim() ? payload.contactPerson.trim() : laporan.contactPerson

    const progressCreates = [
      ...(payload.beritaAcara ?? []).map((fileUrl) => ({
        laporanId,
        tipe: 'berita_acara',
        fileUrl,
        namaFile: fileUrl.split('/').pop() ?? 'berita-acara',
      })),
      ...(payload.spanduk ?? []).map((fileUrl) => ({
        laporanId,
        tipe: 'spanduk',
        fileUrl,
        namaFile: fileUrl.split('/').pop() ?? 'spanduk',
      })),
      ...(payload.surat ?? []).map((fileUrl) => ({
        laporanId,
        tipe: 'surat',
        fileUrl,
        namaFile: fileUrl.split('/').pop() ?? 'surat',
      })),
    ]

    const [, riwayat] = await this.prisma.$transaction([
      this.prisma.laporan.update({
        where: { id: laporanId },
        data: {
          status,
          progresLaporan: payload.progresLaporan,
          levelRisiko: payload.statusKerawanan,
          deskripsi: nextDeskripsi,
          keterangan: nextKeterangan,
          teknisi: nextTeknisi,
          contactPerson: nextContactPerson,
          foto: nextFoto,
        },
      }),
      this.prisma.riwayatLaporan.create({
        data: {
          laporanId,
          oleh,
          statusKerawanan: laporan.levelRisiko,
          progresLaporan: laporan.progresLaporan ?? 'sedang_berlangsung',
          uraianPekerjaan: laporan.deskripsi ?? null,
          upayaPengendalian: laporan.keterangan ?? null,
          pihakLain: laporan.teknisi ?? null,
          contactPerson: laporan.contactPerson ?? null,
          foto: laporan.foto ?? [],
          beritaAcara: currentProgress.berita_acara ?? [],
          spanduk: currentProgress.spanduk ?? [],
          surat: currentProgress.surat ?? [],
        },
      }),
      ...(progressCreates.length > 0
        ? [this.prisma.progressLaporan.createMany({ data: progressCreates })]
        : []),
    ])

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
