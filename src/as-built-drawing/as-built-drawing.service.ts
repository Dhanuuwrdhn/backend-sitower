import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateFolderDto } from './dto/create-as-built-drawing.dto'
import { UpdateAsBuiltDrawingDto } from './dto/update-as-built-drawing.dto'

const CREATED_BY = { select: { id: true, nama: true, role: true } }

const FOLDER_INCLUDE = {
  tower:     { select: { id: true, nama: true } },
  createdBy: CREATED_BY,
  _count:    { select: { dokumen: true, children: true } },
}

const DOKUMEN_INCLUDE = { createdBy: CREATED_BY }

@Injectable()
export class AsBuiltDrawingService {
  constructor(private prisma: PrismaService) {}

  // ── Folders ──────────────────────────────────────────────────────────────────

  /**
   * Lists folders + root-level dokumen at the requested level.
   * - parentId omitted (or "root"/"null") → root level (folders with parentId=null + dokumen with folderId=null)
   * - parentId provided → subfolders under that parent
   */
  async findAllFolders(query: {
    search?: string; tipe?: string; tahun?: string; towerId?: string;
    parentId?: string;
  }) {
    const isRoot = !query.parentId || query.parentId === 'root' || query.parentId === 'null'

    const where: any = { parentId: isRoot ? null : query.parentId }
    if (query.tipe)    where.tipe    = query.tipe
    if (query.tahun)   where.tahun   = Number(query.tahun)
    if (query.towerId) where.towerId = query.towerId
    if (query.search)  where.nama    = { contains: query.search, mode: 'insensitive' }

    const [folders, rootDokumen] = await Promise.all([
      this.prisma.asBuiltFolder.findMany({ where, include: FOLDER_INCLUDE, orderBy: { createdAt: 'desc' } }),
      isRoot
        ? this.prisma.asBuiltDokumen.findMany({
            where: { folderId: null, ...(query.search ? { namaFile: { contains: query.search, mode: 'insensitive' } } : {}) },
            include: DOKUMEN_INCLUDE,
            orderBy: { createdAt: 'desc' },
          })
        : Promise.resolve([]),
    ])

    return { folders, rootDokumen }
  }

  async findFolder(id: string) {
    const folder = await this.prisma.asBuiltFolder.findUnique({
      where: { id },
      include: {
        ...FOLDER_INCLUDE,
        dokumen:  { include: DOKUMEN_INCLUDE, orderBy: { createdAt: 'desc' } },
        children: { include: FOLDER_INCLUDE, orderBy: { createdAt: 'desc' } },
        parent:   { select: { id: true, nama: true, parentId: true } },
      },
    })
    if (!folder) throw new NotFoundException(`Folder ${id} tidak ditemukan`)
    return folder
  }

  /** Build the breadcrumb chain (root → ... → folderId) by walking parent links. */
  async breadcrumb(id: string) {
    const chain: Array<{ id: string; nama: string }> = []
    let cur: { id: string; nama: string; parentId: string | null } | null =
      await this.prisma.asBuiltFolder.findUnique({
        where: { id },
        select: { id: true, nama: true, parentId: true },
      })
    while (cur) {
      chain.unshift({ id: cur.id, nama: cur.nama })
      if (!cur.parentId) break
      cur = await this.prisma.asBuiltFolder.findUnique({
        where: { id: cur.parentId },
        select: { id: true, nama: true, parentId: true },
      })
    }
    return chain
  }

  createFolder(dto: CreateFolderDto, createdById?: string) {
    const { towerId, tipe, parentId, ...rest } = dto
    return this.prisma.asBuiltFolder.create({
      data: {
        ...rest,
        tipe: tipe ?? 'Lainnya',
        ...(towerId && { tower: { connect: { id: towerId } } }),
        ...(parentId && { parent: { connect: { id: parentId } } }),
        ...(createdById && { createdBy: { connect: { id: createdById } } }),
      },
      include: FOLDER_INCLUDE,
    })
  }

  async updateFolder(id: string, dto: UpdateAsBuiltDrawingDto) {
    await this.findFolder(id)
    const { towerId, parentId, ...rest } = dto
    return this.prisma.asBuiltFolder.update({
      where: { id },
      data: {
        ...rest,
        ...(towerId !== undefined && {
          tower: towerId ? { connect: { id: towerId } } : { disconnect: true },
        }),
        ...(parentId !== undefined && {
          parent: parentId ? { connect: { id: parentId } } : { disconnect: true },
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
    return this.prisma.asBuiltDokumen.findMany({
      where: { folderId },
      include: DOKUMEN_INCLUDE,
      orderBy: { createdAt: 'desc' },
    })
  }

  async findDokumen(id: string) {
    const doc = await this.prisma.asBuiltDokumen.findUnique({ where: { id } })
    if (!doc) throw new NotFoundException(`Dokumen ${id} tidak ditemukan`)
    return doc
  }

  async addDokumenMulti(
    folderId: string | null,
    docs: { namaFile: string; fileUrl: string }[],
    createdById?: string,
  ) {
    if (folderId) await this.findFolder(folderId)
    if (!docs.length) return { count: 0, docs: [] }
    const created = await this.prisma.$transaction(
      docs.map((d) => this.prisma.asBuiltDokumen.create({
        data: { folderId: folderId ?? null, createdById: createdById ?? null, ...d },
        include: DOKUMEN_INCLUDE,
      })),
    )
    return { count: created.length, docs: created }
  }

  async deleteDokumen(id: string) {
    await this.findDokumen(id)
    return this.prisma.asBuiltDokumen.delete({ where: { id } })
  }

  // ── Bulk delete ──────────────────────────────────────────────────────────────

  async bulkDelete(folderIds: string[], dokumenIds: string[]) {
    const folders = Array.from(new Set(folderIds ?? []))
    const dokumens = Array.from(new Set(dokumenIds ?? []))
    if (!folders.length && !dokumens.length) {
      return { deletedFolders: 0, deletedDokumens: 0 }
    }
    const [folderRes, dokumenRes] = await this.prisma.$transaction([
      this.prisma.asBuiltFolder.deleteMany({ where: { id: { in: folders } } }),
      this.prisma.asBuiltDokumen.deleteMany({ where: { id: { in: dokumens } } }),
    ])
    return { deletedFolders: folderRes.count, deletedDokumens: dokumenRes.count }
  }
}
