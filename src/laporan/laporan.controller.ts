import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, Request, UseGuards,
  UseInterceptors, UploadedFiles,
} from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname, join } from 'path'
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

@Controller('laporan')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LaporanController {
  constructor(private laporanService: LaporanService) {}

  @Get()
  findAll(@Query() query: QueryLaporanDto) {
    return this.laporanService.findAll(query)
  }

  @Get('stats')
  getStats() {
    return this.laporanService.getStats()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.laporanService.findOne(id)
  }

  @Post()
  create(@Body() dto: CreateLaporanDto, @Request() req: any) {
    return this.laporanService.create(dto, req.user.id)
  }

  @Post('upload-foto')
  @UseInterceptors(FilesInterceptor('foto', 10, { storage: uploadStorage }))
  async uploadFoto(@UploadedFiles() files: Express.Multer.File[], @Request() req: any) {
    const baseUrl = process.env.BACKEND_URL ?? `http://localhost:${process.env.PORT ?? 3001}`
    const urls = files.map((f) => `${baseUrl}/uploads/laporan/${f.filename}`)
    return { urls }
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLaporanDto) {
    return this.laporanService.update(id, dto)
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.laporanService.remove(id)
  }
}
