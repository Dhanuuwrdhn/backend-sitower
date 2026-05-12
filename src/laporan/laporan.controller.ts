import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, Request, UseGuards,
  UseInterceptors, UploadedFiles, UploadedFile,
  BadRequestException,
} from '@nestjs/common'
import { FilesInterceptor, FileInterceptor } from '@nestjs/platform-express'
import { diskStorage, memoryStorage } from 'multer'
import { extname, join } from 'path'
import * as fs from 'fs'
import {
  ApiTags, ApiOperation, ApiBearerAuth, ApiBody,
  ApiParam, ApiQuery, ApiConsumes,
} from '@nestjs/swagger'
import { LaporanService } from './laporan.service'
import { ProgressService } from './progress.service'
import { CreateLaporanDto } from './dto/create-laporan.dto'
import { UpdateLaporanDto } from './dto/update-laporan.dto'
import { QueryLaporanDto } from './dto/query-laporan.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'

const MAX_FILE_BYTES = 10 * 1024 * 1024 // 10 MB

const uploadStorage = diskStorage({
  destination: join(process.cwd(), 'uploads', 'laporan'),
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, `laporan-${unique}${extname(file.originalname)}`)
  },
})

const progressStorage = diskStorage({
  destination: (req, _file, cb) => {
    const dir = join(process.cwd(), 'uploads', 'progress')
    fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, `progress-${unique}${extname(file.originalname)}`)
  },
})

@ApiTags('Laporan')
@ApiBearerAuth()
@Controller('laporan')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LaporanController {
  constructor(
    private laporanService: LaporanService,
    private progressService: ProgressService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List laporan dengan filter & pagination' })
  @ApiQuery({ name: 'search',        required: false })
  @ApiQuery({ name: 'jenisGangguan', required: false, enum: ['pekerjaan_pihak_lain','kebakaran','layangan','pencurian','pemanfaatan_lahan','gangguan','span','cui','cleanup'] })
  @ApiQuery({ name: 'status',        required: false, enum: ['berlangsung','selesai','tidak_ada_aktifitas'] })
  @ApiQuery({ name: 'levelRisiko',   required: false, enum: ['kritis','sedang','aman'] })
  @ApiQuery({ name: 'towerId',       required: false })
  @ApiQuery({ name: 'tglMulai',      required: false, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'tglAkhir',      required: false, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'page',          required: false })
  @ApiQuery({ name: 'limit',         required: false })
  findAll(@Query() query: QueryLaporanDto) {
    return this.laporanService.findAll(query)
  }

  @Get('stats')
  @ApiOperation({ summary: 'Statistik laporan per jenis + total + berlangsung' })
  getStats() {
    return this.laporanService.getStats()
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail satu laporan' })
  @ApiParam({ name: 'id', description: 'Laporan ID' })
  findOne(@Param('id') id: string) {
    return this.laporanService.findOne(id)
  }

  @Post()
  @ApiOperation({ summary: 'Buat laporan baru' })
  @ApiBody({ type: CreateLaporanDto })
  create(@Body() dto: CreateLaporanDto, @Request() req: any) {
    return this.laporanService.create(dto, req.user.id)
  }

  @Post('upload-foto')
  @ApiOperation({ summary: 'Upload foto bukti laporan (multipart, field: foto, maks 10 file)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { foto: { type: 'array', items: { type: 'string', format: 'binary' } } } } })
  @UseInterceptors(FilesInterceptor('foto', 10, { storage: uploadStorage }))
  async uploadFoto(@UploadedFiles() files: Express.Multer.File[], @Request() req: any) {
    const baseUrl = process.env.BACKEND_URL ?? `http://localhost:${process.env.PORT ?? 3001}`
    const urls = files.map((f) => `${baseUrl}/uploads/laporan/${f.filename}`)
    return { urls }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update laporan' })
  @ApiParam({ name: 'id', description: 'Laporan ID' })
  @ApiBody({ type: UpdateLaporanDto })
  update(@Param('id') id: string, @Body() dto: UpdateLaporanDto) {
    return this.laporanService.update(id, dto)
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Hapus laporan (admin)' })
  @ApiParam({ name: 'id', description: 'Laporan ID' })
  remove(@Param('id') id: string) {
    return this.laporanService.remove(id)
  }

  // ── Progress Laporan ──────────────────────────────────────────────────────

  @Get(':id/progress')
  @ApiOperation({ summary: 'List progress dokumen per laporan (grouped by tipe)' })
  getProgress(@Param('id') id: string) {
    return this.progressService.getProgress(id)
  }

  @Post(':id/progress')
  @ApiOperation({ summary: 'Upload dokumen progress (spanduk/brosur/laporan_baru/berita_acara)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: {
    tipe: { type: 'string', enum: ['spanduk','brosur','laporan_baru','berita_acara'] },
    file: { type: 'string', format: 'binary' },
  }}})
  @UseInterceptors(FileInterceptor('file', {
    storage: progressStorage,
    limits: { fileSize: MAX_FILE_BYTES },
    fileFilter: (_req, file, cb) => {
      const allowed = /\.(jpg|jpeg|png|webp|pdf|doc|docx)$/i
      if (!allowed.test(file.originalname)) {
        return cb(new BadRequestException('Format file tidak didukung'), false)
      }
      cb(null, true)
    },
  }))
  async uploadProgress(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('tipe') tipe: string,
    @Request() req: any,
  ) {
    if (!file) throw new BadRequestException('File wajib diupload')
    const VALID_TIPE = ['spanduk','brosur','laporan_baru','berita_acara']
    if (!VALID_TIPE.includes(tipe)) throw new BadRequestException('Tipe progress tidak valid')
    const baseUrl = process.env.BACKEND_URL ?? `http://localhost:${process.env.PORT ?? 3001}`
    const fileUrl = `${baseUrl}/uploads/progress/${file.filename}`
    return this.progressService.addProgress(id, tipe, fileUrl, file.originalname)
  }

  @Delete(':id/progress/:progressId')
  @Roles('admin')
  @ApiOperation({ summary: 'Hapus satu dokumen progress' })
  deleteProgress(@Param('id') id: string, @Param('progressId') progressId: string) {
    return this.progressService.deleteProgress(id, progressId)
  }

  // ── Foto History ──────────────────────────────────────────────────────────

  @Get(':id/foto-history')
  @ApiOperation({ summary: 'List foto history per laporan (by date)' })
  getFotoHistory(@Param('id') id: string) {
    return this.progressService.getFotoHistory(id)
  }

  @Post(':id/foto-update')
  @ApiOperation({ summary: 'Upload foto update (disimpan dengan timestamp)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { foto: { type: 'array', items: { type: 'string', format: 'binary' } } } } })
  @UseInterceptors(FilesInterceptor('foto', 10, {
    storage: uploadStorage,
    limits: { fileSize: MAX_FILE_BYTES },
    fileFilter: (_req, file, cb) => {
      if (!/\.(jpg|jpeg|png|webp)$/i.test(file.originalname)) {
        return cb(new BadRequestException('Hanya JPG/PNG/WEBP'), false)
      }
      cb(null, true)
    },
  }))
  async uploadFotoUpdate(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req: any,
  ) {
    if (!files?.length) throw new BadRequestException('Minimal 1 foto')
    const baseUrl = process.env.BACKEND_URL ?? `http://localhost:${process.env.PORT ?? 3001}`
    const urls = files.map((f) => `${baseUrl}/uploads/laporan/${f.filename}`)
    await this.laporanService.updateFotoUrls(id, urls)
    return this.progressService.addFotoHistory(id, urls)
  }
}
