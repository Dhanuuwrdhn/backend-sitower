import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateFolderDto } from './dto/create-as-built-drawing.dto'
import { UpdateAsBuiltDrawingDto } from './dto/update-as-built-drawing.dto'

const FOLDER_INCLUDE = {
  tower: { select: { id: true, nama: true } },
  _count: { select: { dokumen: true } },
}

@Injectable()
export class AsBuiltDrawingService {
  constructor(private prisma: PrismaService) {}

  // ── Folders ──────────────────────────────────────────────────────────────────

  findAllFolders(query: { search?: string; tipe?: string; tahun?: string; towerId?: string }) {
    const where: any = {}
    if (query.tipe)    where.tipe    = query.tipe
    if (query.tahun)   where.tahun   = Number(query.tahun)
    if (query.towerId) where.towerId = query.towerId
    if (query.search)  where.nama    = { contains: query.search, mode: 'insensitive' }
    return this.prisma.asBuiltFolder.findMany({ where, include: FOLDER_INCLUDE, orderBy: { createdAt: 'desc' } })
  }

  async findFolder(id: string) {
    const folder = await this.prisma.asBuiltFolder.findUnique({
      where: { id },
      include: { ...FOLDER_INCLUDE, dokumen: { orderBy: { createdAt: 'desc' } } },
    })
    if (!folder) throw new NotFoundException(`Folder ${id} tidak ditemukan`)
    return folder
  }

  createFolder(dto: CreateFolderDto) {
    const { towerId, ...rest } = dto
    return this.prisma.asBuiltFolder.create({
      data: { ...rest, ...(towerId && { tower: { connect: { id: towerId } } }) },
      include: FOLDER_INCLUDE,
    })
  }

  async updateFolder(id: string, dto: UpdateAsBuiltDrawingDto) {
    await this.findFolder(id)
    const { towerId, ...rest } = dto
    return this.prisma.asBuiltFolder.update({
      where: { id },
      data: {
        ...rest,
        ...(towerId !== undefined && {
          tower: towerId ? { connect: { id: towerId } } : { disconnect: true },
        }),
      },
      include: FOLDER_INCLUDE,
    })
  }

  async deleteFolder(id: string) {
    await this.findFolder(id)
    return this.prisma.asBuiltFolder.delete({ where: { id } })
  }

  // ── Dokumen ──────────────────────────────────────────────────────────────────

  findDokumenByFolder(folderId: string) {
    return this.prisma.asBuiltDokumen.findMany({ where: { folderId }, orderBy: { createdAt: 'desc' } })
  }

  async findDokumen(id: string) {
    const doc = await this.prisma.asBuiltDokumen.findUnique({ where: { id } })
    if (!doc) throw new NotFoundException(`Dokumen ${id} tidak ditemukan`)
    return doc
  }

  async addDokumen(folderId: string, namaFile: string, fileUrl: string) {
    await this.findFolder(folderId)
    return this.prisma.asBuiltDokumen.create({ data: { folderId, namaFile, fileUrl } })
  }

  async deleteDokumen(id: string) {
    await this.findDokumen(id)
    return this.prisma.asBuiltDokumen.delete({ where: { id } })
  }
}
