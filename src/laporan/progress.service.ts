import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { LaporanService } from './laporan.service'

interface CurrentUser {
  id: string
  role: string
}

@Injectable()
export class ProgressService {
  constructor(
    private prisma: PrismaService,
    private laporanService: LaporanService,
  ) {}

  async addProgress(laporanId: string, tipe: string, fileUrl: string, namaFile: string, currentUser?: CurrentUser) {
    await this.laporanService.assertAccessible(laporanId, currentUser)

    return this.prisma.progressLaporan.create({
      data: { laporanId, tipe, fileUrl, namaFile },
    })
  }

  async getProgress(laporanId: string, currentUser?: CurrentUser) {
    await this.laporanService.assertAccessible(laporanId, currentUser)
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

  async deleteProgress(laporanId: string, progressId: string, currentUser?: CurrentUser) {
    await this.laporanService.assertAccessible(laporanId, currentUser)
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
  async addFotoHistory(laporanId: string, urls: string[], currentUser?: CurrentUser) {
    await this.laporanService.assertAccessible(laporanId, currentUser)
    return this.prisma.fotoHistory.create({ data: { laporanId, urls } })
  }

  async getFotoHistory(laporanId: string, currentUser?: CurrentUser) {
    await this.laporanService.assertAccessible(laporanId, currentUser)
    return this.prisma.fotoHistory.findMany({
      where:   { laporanId },
      orderBy: { createdAt: 'desc' },
    })
  }

  // ── Riwayat Pembaruan Laporan ──────────────────────────────────────────
  async getRiwayat(laporanId: string, currentUser?: CurrentUser) {
    await this.laporanService.assertAccessible(laporanId, currentUser)
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
    currentUser?: CurrentUser,
  ) {
    await this.laporanService.assertAccessible(laporanId, currentUser)
    const [laporan, currentProgress] = await Promise.all([
      this.prisma.laporan.findUnique({ where: { id: laporanId } }),
      this.prisma.progressLaporan.findMany({
        where: { laporanId },
        orderBy: { createdAt: 'asc' },
      }),
    ])
    if (!laporan) throw new NotFoundException(`Laporan ${laporanId} tidak ditemukan`)

    // Group existing progress files by tipe — these are the "old" file lists
    // that will be snapshotted into the new riwayat row.
    const oldFilesByTipe: Record<string, string[]> = {
      berita_acara: [], spanduk: [], surat: [],
    }
    for (const p of currentProgress) {
      if (!oldFilesByTipe[p.tipe]) oldFilesByTipe[p.tipe] = []
      oldFilesByTipe[p.tipe].push(p.fileUrl)
    }

    const status =
      payload.progresLaporan === 'selesai' ? 'selesai' :
      payload.progresLaporan === 'tidak_ada_aktifitas' ? 'tidak_ada_aktifitas' :
      'berlangsung'

    // ── Diff payload vs current laporan to compute changed fields ────────
    const changedFields: string[] = []

    const trimOrEmpty = (s?: string | null) => (s ?? '').trim()
    const textChanged = (next?: string, prev?: string | null) =>
      trimOrEmpty(next).length > 0 && trimOrEmpty(next) !== trimOrEmpty(prev)

    if (payload.statusKerawanan && payload.statusKerawanan !== laporan.levelRisiko) {
      changedFields.push('statusKerawanan')
    }
    if (payload.progresLaporan && payload.progresLaporan !== (laporan.progresLaporan ?? 'sedang_berlangsung')) {
      changedFields.push('progresLaporan')
    }
    if (textChanged(payload.uraianPekerjaan, laporan.deskripsi))   changedFields.push('uraianPekerjaan')
    if (textChanged(payload.upayaPengendalian, laporan.keterangan)) changedFields.push('upayaPengendalian')
    if (textChanged(payload.pihakLain, laporan.teknisi))            changedFields.push('pihakLain')
    if (textChanged(payload.contactPerson, laporan.contactPerson))  changedFields.push('contactPerson')

    if ((payload.foto ?? []).length > 0)        changedFields.push('foto')
    if ((payload.beritaAcara ?? []).length > 0) changedFields.push('beritaAcara')
    if ((payload.spanduk ?? []).length > 0)     changedFields.push('spanduk')
    if ((payload.surat ?? []).length > 0)       changedFields.push('surat')

    // ── Next laporan values: payload wins when provided, else keep current ──
    const nextFoto = (payload.foto ?? []).length > 0 ? payload.foto! : laporan.foto
    const nextDeskripsi   = trimOrEmpty(payload.uraianPekerjaan)   ? payload.uraianPekerjaan!.trim()   : laporan.deskripsi
    const nextKeterangan  = trimOrEmpty(payload.upayaPengendalian) ? payload.upayaPengendalian!.trim() : laporan.keterangan
    const nextTeknisi     = trimOrEmpty(payload.pihakLain)         ? payload.pihakLain!.trim()         : laporan.teknisi
    const nextContactPerson = trimOrEmpty(payload.contactPerson)   ? payload.contactPerson!.trim()     : laporan.contactPerson

    const progressCreates = [
      ...(payload.beritaAcara ?? []).map((fileUrl) => ({
        laporanId, tipe: 'berita_acara', fileUrl,
        namaFile: fileUrl.split('/').pop() ?? 'berita-acara',
      })),
      ...(payload.spanduk ?? []).map((fileUrl) => ({
        laporanId, tipe: 'spanduk', fileUrl,
        namaFile: fileUrl.split('/').pop() ?? 'spanduk',
      })),
      ...(payload.surat ?? []).map((fileUrl) => ({
        laporanId, tipe: 'surat', fileUrl,
        namaFile: fileUrl.split('/').pop() ?? 'surat',
      })),
    ]

    const [updatedLaporan, riwayat] = await this.prisma.$transaction([
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
        include: {
          tower:   { select: { id: true, nama: true, tipe: true, tegangan: true, lokasi: true } },
          pelapor: { select: { id: true, nama: true, jabatan: true, unit: true } },
        },
      }),
      this.prisma.riwayatLaporan.create({
        data: {
          laporanId,
          oleh,
          // Snapshot the OLD (pre-update) values of the laporan. The riwayat
          // row represents "what the report looked like BEFORE this update".
          // changedFields lists which of those fields were actually altered.
          statusKerawanan: laporan.levelRisiko,
          progresLaporan:  laporan.progresLaporan ?? 'sedang_berlangsung',
          uraianPekerjaan:   laporan.deskripsi    ?? null,
          upayaPengendalian: laporan.keterangan   ?? null,
          pihakLain:         laporan.teknisi      ?? null,
          contactPerson:     laporan.contactPerson ?? null,
          foto:        laporan.foto ?? [],
          beritaAcara: oldFilesByTipe.berita_acara ?? [],
          spanduk:     oldFilesByTipe.spanduk     ?? [],
          surat:       oldFilesByTipe.surat       ?? [],
          changedFields,
        },
      }),
      ...(progressCreates.length > 0
        ? [this.prisma.progressLaporan.createMany({ data: progressCreates })]
        : []),
    ])

    // The tower's overall statusKerawanan is derived from the worst levelRisiko
    // among its active laporan. A progress update may have changed levelRisiko,
    // so the tower badge / map marker color must be recomputed here.
    await this.laporanService.syncTowerStatus(updatedLaporan.tower.id)

    return { riwayat, laporan: updatedLaporan }
  }

  async deleteRiwayat(laporanId: string, riwayatId: string, currentUser?: CurrentUser) {
    await this.laporanService.assertAccessible(laporanId, currentUser)
    const rec = await this.prisma.riwayatLaporan.findFirst({
      where: { id: riwayatId, laporanId },
    })
    if (!rec) throw new NotFoundException('Riwayat tidak ditemukan')
    return this.prisma.riwayatLaporan.delete({ where: { id: riwayatId } })
  }
}
