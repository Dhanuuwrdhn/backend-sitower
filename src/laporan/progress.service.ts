import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
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
    await this.laporanService.assertWritable(laporanId, currentUser)

    return this.prisma.progressLaporan.create({
      data: { laporanId, tipe, fileUrl, namaFile },
    })
  }

  async getProgress(laporanId: string, _currentUser?: CurrentUser) {
    await this.laporanService.assertExists(laporanId)
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
    await this.laporanService.assertWritable(laporanId, currentUser)
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
    await this.laporanService.assertWritable(laporanId, currentUser)
    return this.prisma.fotoHistory.create({ data: { laporanId, urls } })
  }

  async getFotoHistory(laporanId: string, _currentUser?: CurrentUser) {
    await this.laporanService.assertExists(laporanId)
    return this.prisma.fotoHistory.findMany({
      where:   { laporanId },
      orderBy: { createdAt: 'desc' },
    })
  }

  // ── Riwayat Pembaruan Laporan ──────────────────────────────────────────
  async getRiwayat(laporanId: string, _currentUser?: CurrentUser) {
    await this.laporanService.assertExists(laporanId)
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
    await this.laporanService.assertWritable(laporanId, currentUser)
    const laporan = await this.prisma.laporan.findUnique({ where: { id: laporanId } })
    if (!laporan) throw new NotFoundException(`Laporan ${laporanId} tidak ditemukan`)

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
          // Snapshot the NEW (post-update) values for fields in changedFields,
          // so each riwayat row displays what was actually changed/added in
          // this Perbarui Laporan submission. Unchanged fields stay null/[] —
          // showField() hides them via the changedFields list.
          statusKerawanan: payload.statusKerawanan,
          progresLaporan:  payload.progresLaporan,
          uraianPekerjaan:   changedFields.includes('uraianPekerjaan')   ? (payload.uraianPekerjaan!.trim())   : null,
          upayaPengendalian: changedFields.includes('upayaPengendalian') ? (payload.upayaPengendalian!.trim()) : null,
          pihakLain:         changedFields.includes('pihakLain')         ? (payload.pihakLain!.trim())         : null,
          contactPerson:     changedFields.includes('contactPerson')     ? (payload.contactPerson!.trim())     : null,
          foto:        payload.foto        ?? [],
          beritaAcara: payload.beritaAcara ?? [],
          spanduk:     payload.spanduk     ?? [],
          surat:       payload.surat       ?? [],
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
    if (currentUser?.role === 'teknisi') {
      throw new ForbiddenException('Hanya admin yang dapat menghapus riwayat pembaruan')
    }

    await this.laporanService.assertExists(laporanId)

    // Fetch all riwayat newest-first to enforce LIFO
    const allRiwayat = await this.prisma.riwayatLaporan.findMany({
      where: { laporanId },
      orderBy: { tanggal: 'desc' },
    })

    if (!allRiwayat.length) throw new NotFoundException('Riwayat tidak ditemukan')

    const latest = allRiwayat[0]
    if (latest.id !== riwayatId) {
      throw new BadRequestException('Hanya riwayat terbaru yang dapat dihapus')
    }
    if (allRiwayat.length === 1) {
      throw new BadRequestException('Tidak dapat menghapus satu-satunya riwayat yang tersisa')
    }

    const previous = allRiwayat[1]
    const changedFields: string[] = Array.isArray(latest.changedFields) ? latest.changedFields : []

    // Roll back Laporan to the state reflected by the previous riwayat entry.
    // statusKerawanan and progresLaporan are always stored, so the previous
    // entry's values are authoritative. Text fields are only stored when they
    // changed, so scan backwards to find the last value before this entry.
    const updateData: Record<string, unknown> = {
      levelRisiko:    previous.statusKerawanan,
      progresLaporan: previous.progresLaporan,
      status:
        previous.progresLaporan === 'selesai'            ? 'selesai'
        : previous.progresLaporan === 'tidak_ada_aktifitas' ? 'tidak_ada_aktifitas'
        : 'berlangsung',
    }

    const findPrevValue = <T>(field: keyof typeof allRiwayat[0], fallback: T): T => {
      const hit = allRiwayat.slice(1).find((r) => {
        const v = r[field]
        return Array.isArray(v) ? (v as unknown[]).length > 0 : v !== null && v !== undefined
      })
      return hit ? (hit[field] as T) : fallback
    }

    if (changedFields.includes('uraianPekerjaan'))   updateData.deskripsi      = findPrevValue('uraianPekerjaan',   null)
    if (changedFields.includes('upayaPengendalian')) updateData.keterangan     = findPrevValue('upayaPengendalian', null)
    if (changedFields.includes('pihakLain'))         updateData.teknisi        = findPrevValue('pihakLain',         null)
    if (changedFields.includes('contactPerson'))     updateData.contactPerson  = findPrevValue('contactPerson',     null)
    if (changedFields.includes('foto'))              updateData.foto           = findPrevValue('foto',              [])

    // beritaAcara, spanduk, surat are stored as ProgressLaporan rows (not on
    // the Laporan record itself), so we must delete those rows explicitly.
    const progressUrlsToDelete = [
      ...(Array.isArray(latest.beritaAcara) ? (latest.beritaAcara as string[]) : []),
      ...(Array.isArray(latest.spanduk)     ? (latest.spanduk     as string[]) : []),
      ...(Array.isArray(latest.surat)       ? (latest.surat       as string[]) : []),
    ].filter(Boolean)

    await this.prisma.$transaction(async (tx) => {
      await tx.riwayatLaporan.delete({ where: { id: riwayatId } })
      await tx.laporan.update({ where: { id: laporanId }, data: updateData })
      if (progressUrlsToDelete.length > 0) {
        await tx.progressLaporan.deleteMany({
          where: { laporanId, fileUrl: { in: progressUrlsToDelete } },
        })
      }
    })

    const laporan = await this.prisma.laporan.findUnique({ where: { id: laporanId }, select: { towerId: true } })
    if (laporan) await this.laporanService.syncTowerStatus(laporan.towerId)

    return { success: true }
  }
}
