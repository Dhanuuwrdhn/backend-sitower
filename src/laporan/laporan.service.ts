import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateLaporanDto } from './dto/create-laporan.dto'
import { UpdateLaporanDto } from './dto/update-laporan.dto'
import { QueryLaporanDto } from './dto/query-laporan.dto'

const INCLUDE_FULL = {
  tower: { select: { id: true, nama: true, tipe: true, tegangan: true, lokasi: true } },
  pelapor: { select: { id: true, nama: true, jabatan: true, unit: true } },
}

function mapLaporan(l: any) {
  if (!l) return l
  return { ...l, tower: l.tower ? { ...l.tower, nomorTower: l.tower.id } : null }
}

@Injectable()
export class LaporanService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryLaporanDto) {
    const page  = Math.max(1, Number(query.page ?? 1))
    const limit = Math.min(100, Math.max(1, Number(query.limit ?? 10)))
    const skip  = (page - 1) * limit

    const where: any = {}

    if (query.jenisGangguan) where.jenisGangguan = query.jenisGangguan
    if (query.status)        where.status        = query.status
    if (query.levelRisiko)   where.levelRisiko   = query.levelRisiko
    if (query.towerId)       where.towerId       = query.towerId

    if (query.tglMulai || query.tglAkhir) {
      where.tanggal = {}
      if (query.tglMulai) where.tanggal.gte = new Date(query.tglMulai)
      if (query.tglAkhir) where.tanggal.lte = new Date(query.tglAkhir + 'T23:59:59')
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
        include: INCLUDE_FULL,
        orderBy: { tanggal: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.laporan.count({ where }),
    ])

    return { data: data.map(mapLaporan), total, page, limit }
  }

  async findOne(id: string) {
    const laporan = await this.prisma.laporan.findUnique({
      where: { id },
      include: INCLUDE_FULL,
    })
    if (!laporan) throw new NotFoundException(`Laporan ${id} tidak ditemukan`)
    return mapLaporan(laporan)
  }

  async getStats() {
    const counts = await this.prisma.laporan.groupBy({
      by: ['jenisGangguan'],
      _count: { id: true },
    })

    const result: Record<string, number> = {
      ppl: 0, kebakaran: 0, layangan: 0, pencurian: 0,
      pemanfaatan: 0, gangguan: 0, cui: 0, cleanup: 0,
    }

    for (const c of counts) {
      const key = c.jenisGangguan === 'pekerjaan_pihak_lain' ? 'ppl' : c.jenisGangguan
      result[key] = c._count.id
    }

    const [total, berlangsung] = await Promise.all([
      this.prisma.laporan.count(),
      this.prisma.laporan.count({ where: { status: 'berlangsung' } }),
    ])

    return { ...result, total, berlangsung }
  }

  async create(dto: CreateLaporanDto, pelaporId: string) {
    const { towerId, tanggal, foto = [], ...rest } = dto
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
    return mapLaporan(result)
  }

  async update(id: string, dto: UpdateLaporanDto) {
    await this.findOne(id)
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
    return mapLaporan(result)
  }

  async remove(id: string) {
    await this.findOne(id)
    return this.prisma.laporan.delete({ where: { id } })
  }

  async updateFotoUrls(id: string, urls: string[]) {
    return this.prisma.laporan.update({
      where: { id },
      data: { foto: { push: urls } },
    })
  }
}
