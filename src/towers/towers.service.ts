import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateTowerDto } from './dto/create-tower.dto'
import { UpdateTowerDto } from './dto/update-tower.dto'

interface TowerQuery {
  tipe?: string
  kondisi?: string
  search?: string
  page?: string | number
  limit?: string | number
}

@Injectable()
export class TowersService {
  constructor(private prisma: PrismaService) {}

  async findAll(query?: TowerQuery) {
    const page  = Math.max(1, Number(query?.page ?? 1))
    const limit = Math.min(200, Math.max(1, Number(query?.limit ?? 50)))
    const skip  = (page - 1) * limit

    const where: any = {}
    if (query?.tipe)    where.tipe    = query.tipe
    if (query?.kondisi) where.kondisi = query.kondisi
    if (query?.search) {
      where.OR = [
        { id:   { contains: query.search, mode: 'insensitive' } },
        { nama: { contains: query.search, mode: 'insensitive' } },
        { lokasi: { contains: query.search, mode: 'insensitive' } },
      ]
    }

    const [data, total] = await Promise.all([
      this.prisma.tower.findMany({ where, orderBy: { id: 'asc' }, skip, take: limit }),
      this.prisma.tower.count({ where }),
    ])

    return { data, total, page, limit }
  }

  /** Returns towers with active laporan mapped as kerawanan[] for the map component */
  async findAllForMap() {
    const towers = await this.prisma.tower.findMany({
      where: { lat: { not: 0 }, lng: { not: 0 } },
      include: {
        laporan: {
          where: { status: { notIn: ['selesai'] } },
          select: { jenisGangguan: true, levelRisiko: true, status: true },
          orderBy: { tanggal: 'desc' },
        },
      },
      orderBy: { id: 'asc' },
    })

    return towers.map((t) => ({
      id: t.id,
      nama: t.nama,
      lat: t.lat,
      lng: t.lng,
      tipe: (t.tipe === 'garduInduk' ? 'gardu' : t.tipe) as 'gardu' | 'SUTET' | 'SUTT' | 'SKTT',
      tegangan: t.tegangan,
      updatedAt: t.updatedAt.toISOString(),
      jalur: t.jalur ?? null,
      nomorUrut: t.nomorUrut ?? null,
      kerawanan: t.laporan.map((l) => ({
        kategori: l.jenisGangguan,
        level: l.levelRisiko as 'kritis' | 'sedang' | 'aman',
        status: l.status,
      })),
    }))
  }

  async findAllForDropdown() {
    const towers = await this.prisma.tower.findMany({
      select: { id: true, nama: true, tipe: true, tegangan: true, lat: true, lng: true, radius: true, jalur: true },
      orderBy: { id: 'asc' },
    })
    // Map id → nomorTower so frontend TowerOption interface is satisfied
    return towers.map((t) => ({
      id: t.id,
      nomorTower: t.id,
      garduInduk: '',
      tipe: t.tipe,
      tegangan: t.tegangan,
      nama: t.nama,
      jalur: t.jalur ?? undefined,
      lat: t.lat,
      lng: t.lng,
      radius: t.radius,
    }))
  }

  async findOne(id: string) {
    const tower = await this.prisma.tower.findUnique({
      where: { id },
      include: {
        laporan: {
          include: { pelapor: { select: { id: true, nama: true, jabatan: true } } },
          orderBy: { tanggal: 'desc' },
        },
        sertifikat: { orderBy: { berlakuHingga: 'asc' } },
        asBuilt: { orderBy: { tahun: 'desc' } },
      },
    })
    if (!tower) throw new NotFoundException(`Tower ${id} tidak ditemukan`)
    return tower
  }

  create(dto: CreateTowerDto) {
    return this.prisma.tower.create({ data: dto })
  }

  async update(id: string, dto: UpdateTowerDto) {
    await this.findOne(id)
    return this.prisma.tower.update({ where: { id }, data: dto })
  }

  async remove(id: string) {
    await this.findOne(id)
    return this.prisma.tower.delete({ where: { id } })
  }
}
