import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateLaporanDto } from './dto/create-laporan.dto'
import { UpdateLaporanDto } from './dto/update-laporan.dto'
import { QueryLaporanDto } from './dto/query-laporan.dto'

const INCLUDE_FULL = {
  tower: { select: { id: true, nama: true, tipe: true, tegangan: true, lokasi: true } },
  pelapor: { select: { id: true, nama: true, jabatan: true, unit: true } },
}

const INCLUDE_LIST = {
  ...INCLUDE_FULL,
  progress: { orderBy: { createdAt: 'desc' as const }, take: 1, select: { tipe: true } },
}

// Map levelRisiko → statusKerawanan priority (higher = worse)
const LEVEL_PRIORITY: Record<string, number> = {
  kritis_tidak_terpenuhi: 4,
  kritis_terpenuhi:       3,
  kritis:                 3, // legacy fallback
  sedang:                 2,
  aman:                   1,
}

// Map jenisGangguan → jenisKerawanan on tower (only kerawanan types)
const KERAWANAN_TYPES = new Set([
  'pekerjaan_pihak_lain', 'kebakaran', 'layangan', 'pencurian', 'pemanfaatan_lahan',
])

function mapLaporan(l: any) {
  if (!l) return l
  return {
    ...l,
    tower: l.tower ? { ...l.tower, nomorTower: l.tower.id } : null,
    latestProgressTipe: l.progress?.[0]?.tipe ?? null,
  }
}

interface CurrentUser {
  id: string
  role: string
}

@Injectable()
export class LaporanService {
  constructor(private prisma: PrismaService) {}

  private buildAccessWhere(currentUser?: CurrentUser) {
    if (currentUser?.role === 'teknisi') {
      return { pelaporId: currentUser.id }
    }
    return {}
  }

  async assertAccessible(id: string, currentUser?: CurrentUser) {
    const laporan = await this.prisma.laporan.findUnique({
      where: { id },
      select: { id: true, pelaporId: true, towerId: true },
    })

    if (!laporan) throw new NotFoundException(`Laporan ${id} tidak ditemukan`)
    if (currentUser?.role === 'teknisi' && laporan.pelaporId !== currentUser.id) {
      throw new ForbiddenException('Anda tidak memiliki akses ke laporan ini')
    }

    return laporan
  }

  async findAll(query: QueryLaporanDto, currentUser?: CurrentUser) {
    const page  = Math.max(1, Number(query.page ?? 1))
    const limit = Math.min(100, Math.max(1, Number(query.limit ?? 10)))
    const skip  = (page - 1) * limit

    const where: any = this.buildAccessWhere(currentUser)

    if (query.jenisGangguan) {
      const vals = query.jenisGangguan.split(',').filter(Boolean)
      if (vals.length > 0) where.jenisGangguan = { in: vals }
    }
    if (query.status) {
      const vals = query.status.split(',').filter(Boolean)
      if (vals.length > 0) where.status = { in: vals }
    }
    if (query.levelRisiko) {
      const vals = query.levelRisiko.split(',').filter(Boolean)
      if (vals.length > 0) {
        // 'kritis' from the filter can match any of the historical/current
        // variants: 'kritis', 'kritis_terpenuhi', 'kritis_tidak_terpenuhi'.
        const expanded = vals.flatMap(v =>
          v === 'kritis' ? ['kritis', 'kritis_terpenuhi', 'kritis_tidak_terpenuhi'] : [v],
        )
        where.levelRisiko = { in: expanded }
      }
    }
    if (query.towerId) {
      const vals = query.towerId.split(',').filter(Boolean)
      if (vals.length > 0) where.towerId = { in: vals }
    }
    if (query.jalur) {
      const vals = query.jalur.split(',').map(s => s.trim()).filter(Boolean)
      if (vals.length > 0) {
        where.tower = { ...(where.tower ?? {}), jalur: { in: vals } }
      }
    }
    if (query.teknisi) {
      const vals = query.teknisi.split(',').filter(Boolean)
      if (vals.length > 0) {
        where.OR = [
          ...(where.OR || []),
          { teknisi: { in: vals } },
          { pelapor: { nama: { in: vals } } }
        ]
      }
    }

    if (query.tglMulai || query.tglAkhir) {
      // Interpret the date strings as Asia/Jakarta (WIB, UTC+7) day boundaries
      // so that "same start and end date" includes the entire WIB day.
      where.tanggal = {}
      if (query.tglMulai) where.tanggal.gte = new Date(`${query.tglMulai}T00:00:00+07:00`)
      if (query.tglAkhir) where.tanggal.lte = new Date(`${query.tglAkhir}T23:59:59.999+07:00`)
    }

    if (query.search) {
      where.OR = [
        { tower: { nama: { contains: query.search, mode: 'insensitive' } } },
        { tower: { id:   { contains: query.search, mode: 'insensitive' } } },
        { lokasiDetail: { contains: query.search, mode: 'insensitive' } },
        { deskripsi:    { contains: query.search, mode: 'insensitive' } },
      ]
    }

    const [data, total] = await Promise.all([
      this.prisma.laporan.findMany({
        where,
        include: INCLUDE_LIST,
        orderBy: { tanggal: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.laporan.count({ where }),
    ])

    return { data: data.map(mapLaporan), total, page, limit }
  }

  async findOne(id: string, currentUser?: CurrentUser) {
    await this.assertAccessible(id, currentUser)

    const laporan = await this.prisma.laporan.findFirst({
      where: { id, ...this.buildAccessWhere(currentUser) },
      include: INCLUDE_FULL,
    })
    if (!laporan) throw new NotFoundException(`Laporan ${id} tidak ditemukan`)
    return mapLaporan(laporan)
  }

  async getStats(currentUser?: CurrentUser) {
    const where = this.buildAccessWhere(currentUser)
    const counts = await this.prisma.laporan.groupBy({
      by: ['jenisGangguan'],
      where,
      _count: { id: true },
    })

    const result: Record<string, number> = {
      ppl: 0, kebakaran: 0, layangan: 0, pencurian: 0,
      pemanfaatan: 0, gangguan: 0, cui: 0, cleanup: 0,
    }

    const KEY_ALIAS: Record<string, string> = {
      pekerjaan_pihak_lain: 'ppl',
      pemanfaatan_lahan: 'pemanfaatan',
    }
    for (const c of counts) {
      const key = KEY_ALIAS[c.jenisGangguan] ?? c.jenisGangguan
      result[key] = c._count.id
    }

    const [total, berlangsung] = await Promise.all([
      this.prisma.laporan.count({ where }),
      this.prisma.laporan.count({ where: { ...where, status: 'berlangsung' } }),
    ])

    return { ...result, total, berlangsung }
  }

  // Recalculate tower statusKerawanan from its active laporan
  private async syncTowerStatus(towerId: string) {
    const active = await this.prisma.laporan.findMany({
      where: { towerId, status: 'berlangsung' },
      select: { levelRisiko: true, jenisGangguan: true },
    })

    if (active.length === 0) {
      await this.prisma.tower.update({
        where: { id: towerId },
        data: { statusKerawanan: 'aman', jenisKerawanan: null },
      })
      return
    }

    // Worst level wins
    let worstLevel = 'aman'
    let worstPriority = 0
    let worstJenis: string | null = null

    for (const l of active) {
      const p = LEVEL_PRIORITY[l.levelRisiko] ?? 1
      if (p > worstPriority) {
        worstPriority = p
        worstLevel = l.levelRisiko
        worstJenis = KERAWANAN_TYPES.has(l.jenisGangguan) ? l.jenisGangguan : worstJenis
      }
    }

    await this.prisma.tower.update({
      where: { id: towerId },
      data: { statusKerawanan: worstLevel, jenisKerawanan: worstJenis },
    })
  }

  async create(dto: CreateLaporanDto, pelaporId: string) {
    const { towerId, tanggal, foto = [], ...rest } = dto

    const tower = await this.prisma.tower.findUnique({ where: { id: towerId } })
    if (!tower) throw new NotFoundException(`Tower dengan id "${towerId}" tidak ditemukan`)

    const result = await this.prisma.laporan.create({
      data: {
        ...rest,
        tanggal: new Date(tanggal),
        foto,
        tower:   { connect: { id: towerId } },
        pelapor: { connect: { id: pelaporId } },
      },
      include: INCLUDE_FULL,
    })

    await this.syncTowerStatus(towerId)
    return mapLaporan(result)
  }

  async update(id: string, dto: UpdateLaporanDto, currentUser?: CurrentUser) {
    const existing = await this.assertAccessible(id, currentUser)
    const { towerId, tanggal, pelaporId: _, ...rest } = dto as any
    const result = await this.prisma.laporan.update({
      where: { id },
      data: {
        ...rest,
        ...(tanggal && { tanggal: new Date(tanggal) }),
        ...(towerId && { tower: { connect: { id: towerId } } }),
      },
      include: INCLUDE_FULL,
    })

    // Sync both old and new tower if towerId changed
    await this.syncTowerStatus(towerId ?? (existing as any).towerId)
    if (towerId && towerId !== (existing as any).towerId) {
      await this.syncTowerStatus((existing as any).towerId)
    }
    return mapLaporan(result)
  }

  async remove(id: string, currentUser?: CurrentUser) {
    const existing = await this.assertAccessible(id, currentUser)
    await this.prisma.laporan.delete({ where: { id } })
    await this.syncTowerStatus(existing.towerId)
  }

  async updateFotoUrls(id: string, urls: string[], currentUser?: CurrentUser) {
    await this.assertAccessible(id, currentUser)
    return this.prisma.laporan.update({
      where: { id },
      data: { foto: { push: urls } },
    })
  }
}
