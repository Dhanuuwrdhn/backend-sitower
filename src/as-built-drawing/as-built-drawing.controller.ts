import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  UseGuards, UseInterceptors, UploadedFile, Res,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
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

@ApiTags('As-Built Drawing')
@ApiBearerAuth()
@Controller('as-built-drawing')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AsBuiltDrawingController {
  constructor(private asBuiltDrawingService: AsBuiltDrawingService) {}

  // ── Folders ──────────────────────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'List semua folder as-built drawing' })
  @ApiQuery({ name: 'search',  required: false })
  @ApiQuery({ name: 'tipe',    required: false, enum: ['Electrical','Mechanical','Civil','Grounding','Lainnya'] })
  @ApiQuery({ name: 'tahun',   required: false })
  @ApiQuery({ name: 'towerId', required: false })
  findAll(@Query() query: { search?: string; tipe?: string; tahun?: string; towerId?: string }) {
    return this.asBuiltDrawingService.findAllFolders(query)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail folder + list dokumen' })
  @ApiParam({ name: 'id', description: 'Folder ID' })
  findFolder(@Param('id') id: string) {
    return this.asBuiltDrawingService.findFolder(id)
  }

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Buat folder as-built drawing baru (admin)' })
  @ApiBody({ type: CreateFolderDto })
  createFolder(@Body() dto: CreateFolderDto) {
    return this.asBuiltDrawingService.createFolder(dto)
  }

  @Put(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update folder (admin)' })
  @ApiParam({ name: 'id', description: 'Folder ID' })
  @ApiBody({ type: UpdateAsBuiltDrawingDto })
  updateFolder(@Param('id') id: string, @Body() dto: UpdateAsBuiltDrawingDto) {
    return this.asBuiltDrawingService.updateFolder(id, dto)
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Hapus folder + semua dokumen (admin)' })
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

  @Post(':folderId/dokumen')
  @Roles('admin')
  @ApiOperation({ summary: 'Upload dokumen ke folder (admin)' })
  @ApiParam({ name: 'folderId', description: 'Folder ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads', 'asbuilt'),
        filename: (_req, file, cb) => cb(null, `${Date.now()}${extname(file.originalname)}`),
      }),
    }),
  )
  uploadDokumen(
    @Param('folderId') folderId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const fileUrl = `/uploads/asbuilt/${file.filename}`
    return this.asBuiltDrawingService.addDokumen(folderId, file.originalname, fileUrl)
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
    const mime = ext === '.pdf' ? 'application/pdf'
      : ['.png', '.jpg', '.jpeg'].includes(ext) ? `image/${ext.slice(1)}`
      : 'application/octet-stream'
    res.setHeader('Content-Type', mime)
    res.setHeader('Content-Disposition', `inline; filename="${doc.namaFile}"`)
    createReadStream(filePath).pipe(res)
  }

  @Delete('dokumen/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Hapus dokumen (admin)' })
  @ApiParam({ name: 'id', description: 'Dokumen ID' })
  deleteDokumen(@Param('id') id: string) {
    return this.asBuiltDrawingService.deleteDokumen(id)
  }
}
