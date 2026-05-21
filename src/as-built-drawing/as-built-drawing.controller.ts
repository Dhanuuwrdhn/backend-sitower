import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, Req,
  UseGuards, UseInterceptors, UploadedFiles, Res,
} from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname, join } from 'path'
import type { Response } from 'express'
import { createReadStream, existsSync } from 'fs'
import {
  ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes,
  ApiBody, ApiParam, ApiQuery,
} from '@nestjs/swagger'
import { AsBuiltDrawingService } from './as-built-drawing.service'
import { CreateFolderDto } from './dto/create-as-built-drawing.dto'
import { UpdateAsBuiltDrawingDto } from './dto/update-as-built-drawing.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'

const DISK_STORAGE = diskStorage({
  destination: join(process.cwd(), 'uploads', 'asbuilt'),
  filename: (_req, file, cb) => cb(
    null,
    `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${extname(file.originalname)}`,
  ),
})

const userId = (req: any): string | undefined => req?.user?.sub ?? req?.user?.id

@ApiTags('As-Built Drawing')
@ApiBearerAuth()
@Controller('as-built-drawing')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AsBuiltDrawingController {
  constructor(private asBuiltDrawingService: AsBuiltDrawingService) {}

  // ── Folders ──────────────────────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'List folder + dokumen di level tertentu (root jika parentId kosong)' })
  @ApiQuery({ name: 'search',   required: false })
  @ApiQuery({ name: 'tipe',     required: false })
  @ApiQuery({ name: 'tahun',    required: false })
  @ApiQuery({ name: 'towerId',  required: false })
  @ApiQuery({ name: 'parentId', required: false, description: '"root"/null untuk root level' })
  findAll(@Query() query: { search?: string; tipe?: string; tahun?: string; towerId?: string; parentId?: string }) {
    return this.asBuiltDrawingService.findAllFolders(query)
  }

  @Get('breadcrumb/:id')
  @ApiOperation({ summary: 'Breadcrumb chain dari root ke folder ini' })
  @ApiParam({ name: 'id', description: 'Folder ID' })
  breadcrumb(@Param('id') id: string) {
    return this.asBuiltDrawingService.breadcrumb(id)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail folder + subfolders + dokumen' })
  @ApiParam({ name: 'id', description: 'Folder ID' })
  findFolder(@Param('id') id: string) {
    return this.asBuiltDrawingService.findFolder(id)
  }

  @Post()
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'Buat folder as-built drawing baru (admin/superadmin)' })
  @ApiBody({ type: CreateFolderDto })
  createFolder(@Body() dto: CreateFolderDto, @Req() req: any) {
    return this.asBuiltDrawingService.createFolder(dto, userId(req))
  }

  @Put(':id')
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'Update folder (admin/superadmin)' })
  @ApiParam({ name: 'id', description: 'Folder ID' })
  @ApiBody({ type: UpdateAsBuiltDrawingDto })
  updateFolder(@Param('id') id: string, @Body() dto: UpdateAsBuiltDrawingDto) {
    return this.asBuiltDrawingService.updateFolder(id, dto)
  }

  @Delete(':id')
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'Hapus folder + semua subfolder & dokumen (admin/superadmin)' })
  @ApiParam({ name: 'id', description: 'Folder ID' })
  deleteFolder(@Param('id') id: string) {
    return this.asBuiltDrawingService.deleteFolder(id)
  }

  // ── Dokumen ──────────────────────────────────────────────────────────────────

  @Get(':folderId/dokumen')
  @ApiOperation({ summary: 'List dokumen dalam folder' })
  @ApiParam({ name: 'folderId', description: 'Folder ID' })
  findDokumen(@Param('folderId') folderId: string) {
    return this.asBuiltDrawingService.findDokumenByFolder(folderId)
  }

  /** Upload langsung di root (tanpa folder). */
  @Post('dokumen')
  @Roles('admin', 'superadmin', 'teknisi')
  @ApiOperation({ summary: 'Upload 1+ dokumen langsung di root (admin/superadmin/teknisi)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { files: { type: 'array', items: { type: 'string', format: 'binary' } } },
    },
  })
  @UseInterceptors(FilesInterceptor('files', 20, { storage: DISK_STORAGE }))
  uploadRootDokumen(@UploadedFiles() files: Express.Multer.File[], @Req() req: any) {
    const docs = (files ?? []).map((f) => ({
      namaFile: f.originalname,
      fileUrl: `/uploads/asbuilt/${f.filename}`,
    }))
    return this.asBuiltDrawingService.addDokumenMulti(null, docs, userId(req))
  }

  @Post(':folderId/dokumen')
  @Roles('admin', 'superadmin', 'teknisi')
  @ApiOperation({ summary: 'Upload 1+ dokumen ke folder (admin/superadmin/teknisi)' })
  @ApiParam({ name: 'folderId', description: 'Folder ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { files: { type: 'array', items: { type: 'string', format: 'binary' } } },
    },
  })
  @UseInterceptors(FilesInterceptor('files', 20, { storage: DISK_STORAGE }))
  uploadDokumen(
    @Param('folderId') folderId: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: any,
  ) {
    const docs = (files ?? []).map((f) => ({
      namaFile: f.originalname,
      fileUrl: `/uploads/asbuilt/${f.filename}`,
    }))
    return this.asBuiltDrawingService.addDokumenMulti(folderId, docs, userId(req))
  }

  @Get('dokumen/:id')
  @ApiOperation({ summary: 'Metadata satu dokumen' })
  @ApiParam({ name: 'id', description: 'Dokumen ID' })
  findOneDokumen(@Param('id') id: string) {
    return this.asBuiltDrawingService.findDokumen(id)
  }

  @Get('dokumen/:id/preview')
  @ApiOperation({ summary: 'Stream file dokumen inline untuk preview (PDF/gambar)' })
  @ApiParam({ name: 'id', description: 'Dokumen ID' })
  async previewDokumen(@Param('id') id: string, @Res({ passthrough: false }) res: Response) {
    const doc = await this.asBuiltDrawingService.findDokumen(id)
    const filePath = join(process.cwd(), doc.fileUrl)
    if (!existsSync(filePath)) {
      return res.status(404).json({ message: 'File tidak ditemukan di server' })
    }
    const ext = extname(doc.namaFile).toLowerCase()
    const IMG: Record<string, string> = {
      '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
      '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml',
      '.bmp': 'image/bmp',
    }
    const mime = ext === '.pdf' ? 'application/pdf'
      : IMG[ext]
      ?? 'application/octet-stream'
    res.setHeader('Content-Type', mime)
    res.setHeader('Content-Disposition', `inline; filename="${doc.namaFile}"`)
    createReadStream(filePath).pipe(res)
  }

  @Delete('dokumen/:id')
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'Hapus dokumen (admin/superadmin)' })
  @ApiParam({ name: 'id', description: 'Dokumen ID' })
  deleteDokumen(@Param('id') id: string) {
    return this.asBuiltDrawingService.deleteDokumen(id)
  }
}
