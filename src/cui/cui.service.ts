import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateCuiDto } from './dto/create-cui.dto'
import { UpdateCuiDto } from './dto/update-cui.dto'

type SafeUser = { id: string; role: string }

const INCLUDE_TOWER = {
  tower: {
    select: {
      id: true,
      nama: true,
      route: { select: { id: true, nama: true } },
    },
  },
  createdBy: { select: { id: true, nama: true } },
}

@Injectable()
export class CuiService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { search?: string; status?: string; page?: number; limit?: number }) {
    const page = Math.max(1, Number(query.page) || 1)
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 10))
    const where: any = {}
    if (query.status) where.status = query.status
    if (query.search) {
      const s = query.search
      where.OR = [
        { keterangan: { contains: s, mode: 'insensitive' } },
        { tower: { nama: { contains: s, mode: 'insensitive' } } },
        { tower: { route: { nama: { contains: s, mode: 'insensitive' } } } },
      ]
    }
    const [data, total] = await this.prisma.$transaction([
      this.prisma.climbUpInspection.findMany({
        where,
        include: INCLUDE_TOWER,
        orderBy: { tanggal: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.climbUpInspection.count({ where }),
    ])
    return { data, total, page, limit }
  }

  async findOne(id: string) {
    const row = await this.prisma.climbUpInspection.findUnique({
      where: { id },
      include: INCLUDE_TOWER,
    })
    if (!row) throw new NotFoundException('CUI tidak ditemukan')
    return row
  }

  async create(dto: CreateCuiDto, user: SafeUser) {
    return this.prisma.climbUpInspection.create({
      data: {
        towerId: dto.towerId,
        tanggal: new Date(dto.tanggal),
        keterangan: dto.keterangan,
        status: dto.status ?? 'sedang_berlangsung',
        createdById: user.id,
      },
      include: INCLUDE_TOWER,
    })
  }

  async update(id: string, dto: UpdateCuiDto) {
    await this.findOne(id)
    return this.prisma.climbUpInspection.update({
      where: { id },
      data: {
        ...(dto.towerId !== undefined && { towerId: dto.towerId }),
        ...(dto.tanggal !== undefined && { tanggal: new Date(dto.tanggal) }),
        ...(dto.keterangan !== undefined && { keterangan: dto.keterangan }),
        ...(dto.status !== undefined && { status: dto.status }),
      },
      include: INCLUDE_TOWER,
    })
  }

  async remove(id: string, user: SafeUser) {
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      throw new ForbiddenException('Hanya admin yang dapat menghapus CUI')
    }
    await this.findOne(id)
    await this.prisma.climbUpInspection.delete({ where: { id } })
    return { message: 'CUI dihapus' }
  }
}
