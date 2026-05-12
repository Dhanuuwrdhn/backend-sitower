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
}
