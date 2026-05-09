import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  UseGuards, UseInterceptors, UploadedFile, Res,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname, join } from 'path'
import type { Response } from 'express'
import { createReadStream, existsSync } from 'fs'
import { SertifikatService } from './sertifikat.service'
import { CreateFolderDto } from './dto/create-sertifikat.dto'
import { UpdateSertifikatDto } from './dto/update-sertifikat.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'

@Controller('sertifikat')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SertifikatController {
  constructor(private sertifikatService: SertifikatService) {}

  // ─── Folders ──────────────────────────────────────────────────────────────────

  @Get()
  findAll(
    @Query() query: { search?: string; kategori?: string; status?: string },
  ) {
    return this.sertifikatService.findAllFolders(query)
  }

  @Get(':id')
  findFolder(@Param('id') id: string) {
    return this.sertifikatService.findFolder(id)
  }

  @Post()
  @Roles('admin')
  createFolder(@Body() dto: CreateFolderDto) {
    return this.sertifikatService.createFolder(dto)
  }

  @Put(':id')
  @Roles('admin')
  updateFolder(@Param('id') id: string, @Body() dto: UpdateSertifikatDto) {
    return this.sertifikatService.updateFolder(id, dto)
  }

  @Delete(':id')
  @Roles('admin')
  deleteFolder(@Param('id') id: string) {
    return this.sertifikatService.deleteFolder(id)
  }

  // ─── Dokumen ──────────────────────────────────────────────────────────────────

  @Get(':folderId/dokumen')
  findDokumen(@Param('folderId') folderId: string) {
    return this.sertifikatService.findDokumenByFolder(folderId)
  }

  @Post(':folderId/dokumen')
  @Roles('admin')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads', 'sertifikat'),
        filename: (_req, file, cb) => cb(null, `${Date.now()}${extname(file.originalname)}`),
      }),
    }),
  )
  uploadDokumen(
    @Param('folderId') folderId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const fileUrl = `/uploads/sertifikat/${file.filename}`
    return this.sertifikatService.addDokumen(folderId, file.originalname, fileUrl)
  }

  @Get('dokumen/:id')
  findOneDokumen(@Param('id') id: string) {
    return this.sertifikatService.findDokumen(id)
  }

  @Get('dokumen/:id/preview')
  async previewDokumen(@Param('id') id: string, @Res({ passthrough: false }) res: Response) {
    const doc = await this.sertifikatService.findDokumen(id)
    const filePath = join(process.cwd(), doc.fileUrl)
    if (!existsSync(filePath)) {
      return res.status(404).json({ message: 'File tidak ditemukan di server' })
    }
    const ext = extname(doc.namaFile).toLowerCase()
    const mime = ext === '.pdf' ? 'application/pdf' : 'application/octet-stream'
    res.setHeader('Content-Type', mime)
    res.setHeader('Content-Disposition', `inline; filename="${doc.namaFile}"`)
    createReadStream(filePath).pipe(res)
  }

  @Delete('dokumen/:id')
  @Roles('admin')
  deleteDokumen(@Param('id') id: string) {
    return this.sertifikatService.deleteDokumen(id)
  }
}
