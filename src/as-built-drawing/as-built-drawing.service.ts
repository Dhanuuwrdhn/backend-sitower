import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateAsBuiltDrawingDto } from './dto/create-as-built-drawing.dto'
import { UpdateAsBuiltDrawingDto } from './dto/update-as-built-drawing.dto'

@Injectable()
export class AsBuiltDrawingService {
  constructor(private prisma: PrismaService) {}

  findAll(query?: { towerId?: string; tipe?: string; tahun?: number }) {
    return this.prisma.asBuiltDrawing.findMany({
      where: {
        ...(query?.towerId && { towerId: query.towerId }),
        ...(query?.tipe && { tipe: query.tipe }),
        ...(query?.tahun && { tahun: Number(query.tahun) }),
      },
      include: { tower: { select: { id: true, nama: true } } },
      orderBy: { tahun: 'desc' },
    })
  }

  async findOne(id: string) {
    const data = await this.prisma.asBuiltDrawing.findUnique({
      where: { id },
      include: { tower: { select: { id: true, nama: true } } },
    })
    if (!data) throw new NotFoundException(`As-Built Drawing ${id} tidak ditemukan`)
    return data
  }

  create(dto: CreateAsBuiltDrawingDto) {
    return this.prisma.asBuiltDrawing.create({ data: dto })
  }

  async update(id: string, dto: UpdateAsBuiltDrawingDto) {
    await this.findOne(id)
    return this.prisma.asBuiltDrawing.update({ where: { id }, data: dto })
  }

  async remove(id: string) {
    await this.findOne(id)
    return this.prisma.asBuiltDrawing.delete({ where: { id } })
  }

  async updateFileUrl(id: string, fileUrl: string) {
    return this.prisma.asBuiltDrawing.update({ where: { id }, data: { fileUrl } })
  }
}
