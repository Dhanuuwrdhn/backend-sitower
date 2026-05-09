import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateFolderDto } from './dto/create-sertifikat.dto'
import { UpdateSertifikatDto } from './dto/update-sertifikat.dto'

@Injectable()
export class SertifikatService {
  constructor(private prisma: PrismaService) {}

  // ─── Folders ──────────────────────────────────────────────────────────────────

  findAllFolders(query?: { search?: string; kategori?: string; status?: string }) {
    return this.prisma.sertifikat.findMany({
      where: {
        ...(query?.kategori && { kategori: query.kategori }),
        ...(query?.status && { status: query.status }),
        ...(query?.search && {
          tower: { nama: { contains: query.search, mode: 'insensitive' as const } },
        }),
      },
      include: {
        tower: { select: { id: true, nama: true } },
        _count: { select: { dokumen: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findFolder(id: string) {
    const folder = await this.prisma.sertifikat.findUnique({
      where: { id },
      include: {
        tower: { select: { id: true, nama: true } },
        dokumen: { orderBy: { createdAt: 'desc' } },
      },
    })
    if (!folder) throw new NotFoundException(`Folder ${id} tidak ditemukan`)
    return folder
  }

  createFolder(dto: CreateFolderDto) {
    return this.prisma.sertifikat.create({
      data: {
        nama: dto.nama,
        kategori: dto.kategori,
        status: dto.status ?? 'berlaku',
        ...(dto.towerId && { towerId: dto.towerId }),
        ...(dto.berlakuHingga && { berlakuHingga: new Date(dto.berlakuHingga) }),
      },
      include: { tower: { select: { id: true, nama: true } } },
    })
  }

  async updateFolder(id: string, dto: UpdateSertifikatDto) {
    await this.findFolder(id)
    return this.prisma.sertifikat.update({
      where: { id },
      data: {
        ...(dto.nama && { nama: dto.nama }),
        ...(dto.kategori && { kategori: dto.kategori }),
        ...(dto.status && { status: dto.status }),
        ...(dto.towerId !== undefined && { towerId: dto.towerId || null }),
        ...(dto.berlakuHingga && { berlakuHingga: new Date(dto.berlakuHingga) }),
      },
    })
  }

  async deleteFolder(id: string) {
    await this.findFolder(id)
    return this.prisma.sertifikat.delete({ where: { id } })
  }

  // ─── Dokumen ──────────────────────────────────────────────────────────────────

  async findDokumenByFolder(folderId: string) {
    await this.findFolder(folderId)
    return this.prisma.sertifikatDokumen.findMany({
      where: { folderId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findDokumen(id: string) {
    const doc = await this.prisma.sertifikatDokumen.findUnique({
      where: { id },
      include: { folder: { select: { id: true, nama: true } } },
    })
    if (!doc) throw new NotFoundException(`Dokumen ${id} tidak ditemukan`)
    return doc
  }

  async addDokumen(folderId: string, namaFile: string, fileUrl: string) {
    await this.findFolder(folderId)
    return this.prisma.sertifikatDokumen.create({
      data: { folderId, namaFile, fileUrl },
    })
  }

  async deleteDokumen(id: string) {
    await this.findDokumen(id)
    return this.prisma.sertifikatDokumen.delete({ where: { id } })
  }
}
