import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateSertifikatDto } from './dto/create-sertifikat.dto'
import { UpdateSertifikatDto } from './dto/update-sertifikat.dto'

@Injectable()
export class SertifikatService {
  constructor(private prisma: PrismaService) {}

  findAll(query?: { towerId?: string; status?: string; tipe?: string }) {
    return this.prisma.sertifikat.findMany({
      where: {
        ...(query?.towerId && { towerId: query.towerId }),
        ...(query?.status && { status: query.status }),
        ...(query?.tipe && { tipe: query.tipe }),
      },
      include: { tower: { select: { id: true, nama: true } } },
      orderBy: { berlakuHingga: 'asc' },
    })
  }

  async findOne(id: string) {
    const data = await this.prisma.sertifikat.findUnique({
      where: { id },
      include: { tower: { select: { id: true, nama: true } } },
    })
    if (!data) throw new NotFoundException(`Sertifikat ${id} tidak ditemukan`)
    return data
  }

  create(dto: CreateSertifikatDto) {
    return this.prisma.sertifikat.create({
      data: { ...dto, berlakuHingga: new Date(dto.berlakuHingga) },
    })
  }

  async update(id: string, dto: UpdateSertifikatDto) {
    await this.findOne(id)
    return this.prisma.sertifikat.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.berlakuHingga && { berlakuHingga: new Date(dto.berlakuHingga) }),
      },
    })
  }

  async remove(id: string) {
    await this.findOne(id)
    return this.prisma.sertifikat.delete({ where: { id } })
  }

  async updateFileUrl(id: string, fileUrl: string) {
    return this.prisma.sertifikat.update({ where: { id }, data: { fileUrl } })
  }
}
