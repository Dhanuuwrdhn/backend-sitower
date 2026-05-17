import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateUnitDto } from './dto/create-unit.dto'
import { UpdateUnitDto } from './dto/update-unit.dto'

@Injectable()
export class UnitsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.unit.findMany({ orderBy: { nama: 'asc' } })
  }

  async create(dto: CreateUnitDto) {
    const exists = await this.prisma.unit.findUnique({ where: { nama: dto.nama } })
    if (exists) throw new ConflictException(`Unit "${dto.nama}" sudah ada`)
    return this.prisma.unit.create({ data: { nama: dto.nama } })
  }

  async update(id: string, dto: UpdateUnitDto) {
    const unit = await this.prisma.unit.findUnique({ where: { id } })
    if (!unit) throw new NotFoundException('Unit tidak ditemukan')

    if (dto.nama && dto.nama !== unit.nama) {
      const exists = await this.prisma.unit.findUnique({ where: { nama: dto.nama } })
      if (exists) throw new ConflictException(`Unit "${dto.nama}" sudah ada`)

      // propagate rename to Pegawai records that reference this unit
      await this.prisma.pegawai.updateMany({
        where: { unit: unit.nama },
        data: { unit: dto.nama },
      })
    }

    return this.prisma.unit.update({ where: { id }, data: dto })
  }

  async remove(id: string) {
    const unit = await this.prisma.unit.findUnique({ where: { id } })
    if (!unit) throw new NotFoundException('Unit tidak ditemukan')

    const inUse = await this.prisma.pegawai.count({ where: { unit: unit.nama } })
    if (inUse > 0) {
      throw new ConflictException(`Unit "${unit.nama}" masih dipakai oleh ${inUse} user`)
    }

    return this.prisma.unit.delete({ where: { id } })
  }
}
