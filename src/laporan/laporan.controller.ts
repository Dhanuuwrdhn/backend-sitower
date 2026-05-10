import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, Request, UseGuards,
  UseInterceptors, UploadedFiles,
} from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname, join } from 'path'
import {
  ApiTags, ApiOperation, ApiBearerAuth, ApiBody,
  ApiParam, ApiQuery, ApiConsumes,
} from '@nestjs/swagger'
import { LaporanService } from './laporan.service'
import { CreateLaporanDto } from './dto/create-laporan.dto'
import { UpdateLaporanDto } from './dto/update-laporan.dto'
import { QueryLaporanDto } from './dto/query-laporan.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'

const uploadStorage = diskStorage({
  destination: join(process.cwd(), 'uploads', 'laporan'),
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, `laporan-${unique}${extname(file.originalname)}`)
  },
})

@ApiTags('Laporan')
@ApiBearerAuth()
@Controller('laporan')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LaporanController {
  constructor(private laporanService: LaporanService) {}

  @Get()
  @ApiOperation({ summary: 'List laporan dengan filter & pagination' })
  @ApiQuery({ name: 'search',        required: false })
  @ApiQuery({ name: 'jenisGangguan', required: false, enum: ['pekerjaan_pihak_lain','kebakaran','layangan','pencurian','pemanfaatan_lahan','gangguan','span','cui','cleanup'] })
  @ApiQuery({ name: 'status',        required: false, enum: ['berlangsung','selesai','tidak_ada_aktifitas'] })
  @ApiQuery({ name: 'levelRisiko',   required: false, enum: ['tinggi','sedang','rendah'] })
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
}
