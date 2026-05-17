import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards, ParseIntPipe, Request,
  UploadedFile, UploadedFiles, UseInterceptors, Res,
} from '@nestjs/common'
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname, join } from 'path'
import { createReadStream, existsSync } from 'fs'
import type { Response } from 'express'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiQuery, ApiBody } from '@nestjs/swagger'
import { AsetService } from './aset.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'
import { CreateGarduIndukDto } from './dto/create-gardu-induk.dto'
import { UpdateGarduIndukDto } from './dto/update-gardu-induk.dto'
import { CreateRouteDto } from './dto/create-route.dto'
import { UpdateRouteDto } from './dto/update-route.dto'
import { CreateTowerAsetDto } from './dto/create-tower-aset.dto'
import { UpdateTowerAsetDto } from './dto/update-tower-aset.dto'
import { CreateAsetSertifikatDto, UpdateAsetSertifikatDto } from './dto/certificate.dto'

@ApiTags('Data Aset Transmisi')
@ApiBearerAuth()
@Controller('aset')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AsetController {
  constructor(private asetService: AsetService) {}

  // ── Line Types ──────────────────────────────────────────────────────────────
  @Get('line-types')
  @ApiOperation({ summary: 'List tipe saluran transmisi (SUTT/SUTET/SKTT)' })
  findAllLineTypes() { return this.asetService.findAllLineTypes() }

  // ── Gardu Induk ─────────────────────────────────────────────────────────────
  @Get('gardu-induk')
  @ApiOperation({ summary: 'List semua gardu induk' })
  findAllGardu() { return this.asetService.findAllGardu() }

  @Get('gardu-induk/:id')
  @ApiOperation({ summary: 'Detail gardu induk beserta jalur terkait' })
  findOneGardu(@Param('id', ParseIntPipe) id: number) { return this.asetService.findOneGardu(id) }

  @Post('gardu-induk')
  @Roles('admin')
  @ApiOperation({ summary: 'Tambah gardu induk (admin)' })
  createGardu(@Body() dto: CreateGarduIndukDto) { return this.asetService.createGardu(dto) }

  @Put('gardu-induk/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update gardu induk (admin)' })
  updateGardu(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateGarduIndukDto) {
    return this.asetService.updateGardu(id, dto)
  }

  // ── Routes ──────────────────────────────────────────────────────────────────
  @Get('routes')
  @ApiOperation({ summary: 'List semua jalur transmisi' })
  findAllRoutes() { return this.asetService.findAllRoutes() }

  @Get('routes/:id')
  @ApiOperation({ summary: 'Detail jalur beserta tower-tower di dalamnya' })
  findOneRoute(@Param('id', ParseIntPipe) id: number) { return this.asetService.findOneRoute(id) }

  @Post('routes')
  @Roles('admin')
  @ApiOperation({ summary: 'Tambah jalur transmisi (admin)' })
  createRoute(@Body() dto: CreateRouteDto) { return this.asetService.createRoute(dto) }

  @Put('routes/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update jalur transmisi (admin)' })
  updateRoute(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRouteDto) {
    return this.asetService.updateRoute(id, dto)
  }

  // ── Towers ──────────────────────────────────────────────────────────────────
  @Get('towers')
  @ApiOperation({ summary: 'List tower dengan filter route, status, kerawanan, bbox' })
  @ApiQuery({ name: 'route_id',      required: false })
  @ApiQuery({ name: 'status',        required: false, enum: ['aman', 'sedang', 'kritis'] })
  @ApiQuery({ name: 'kerawanan_type', required: false, enum: ['ppl', 'layangan', 'kebakaran', 'pencurian', 'pemanfaatan_lahan'] })
  @ApiQuery({ name: 'bbox',          required: false, description: 'minLat,minLng,maxLat,maxLng' })
  @ApiQuery({ name: 'page',          required: false })
  @ApiQuery({ name: 'limit',         required: false })
  findAllTowers(@Query() query: any) { return this.asetService.findAllTowers(query) }

  // Must be declared BEFORE @Get('towers/:id') so NestJS does not treat
  // "dropdown" as a tower id parameter.
  @Get('towers/dropdown')
  @ApiOperation({ summary: 'Dropdown semua tower (tanpa pagination, untuk form Ruas)' })
  findAllTowersForDropdown() { return this.asetService.findAllTowersForDropdown() }

  @Get('towers/:id')
  @ApiOperation({ summary: 'Detail tower beserta history laporan' })
  findOneTower(@Param('id') id: string, @Request() req: any) { return this.asetService.findOneTower(id, req.user) }

  @Post('towers')
  @Roles('admin')
  @UseInterceptors(FilesInterceptor('files', 10, {
    storage: diskStorage({
      destination: join(process.cwd(), 'uploads', 'sertifikat'),
      filename: (_req, file, cb) => cb(null, `${Date.now()}${extname(file.originalname)}`),
    }),
  }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Tambah tower baru (admin)' })
  createTower(
    @Body() dto: CreateTowerAsetDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.asetService.createTower(dto, files)
  }

  @Put('towers/:id')
  @Roles('admin')
  @UseInterceptors(FilesInterceptor('files', 10, {
    storage: diskStorage({
      destination: join(process.cwd(), 'uploads', 'sertifikat'),
      filename: (_req, file, cb) => cb(null, `${Date.now()}${extname(file.originalname)}`),
    }),
  }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update tower (admin)' })
  updateTower(
    @Param('id') id: string,
    @Body() dto: UpdateTowerAsetDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.asetService.updateTower(id, dto, files)
  }

  @Delete('towers/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Hapus tower (admin)' })
  removeTower(@Param('id') id: string) { return this.asetService.removeTower(id) }

  // ── Map ─────────────────────────────────────────────────────────────────────
  @Get('map/overview')
  @ApiOperation({ summary: 'Data lengkap peta: routes polyline + gardu + towers' })
  getMapOverview(@Request() req: any) { return this.asetService.getMapOverview(req.user) }

  @Get('map/routes')
  @ApiOperation({ summary: 'Polyline per jalur transmisi' })
  getMapRoutes() { return this.asetService.getMapRoutes() }

  @Get('map/filter')
  @ApiOperation({ summary: 'Filter marker peta berdasarkan jenis kerawanan' })
  @ApiQuery({ name: 'type', required: false, enum: ['semua', 'ppl', 'layangan', 'kebakaran', 'pencurian', 'pemanfaatan_lahan', 'kritis', 'sedang', 'aman'] })
  getMapFilter(@Query('type') type: string = 'semua', @Request() req: any) { return this.asetService.getMapFilter(type, req.user) }

  // ── Stats ───────────────────────────────────────────────────────────────────
  @Get('stats')
  @ApiOperation({ summary: 'Statistik aset: total, aman/sedang/kritis, per jenis kerawanan' })
  getStats(@Request() req: any) { return this.asetService.getStats(req.user) }

  // ── Import ──────────────────────────────────────────────────────────────────
  @Post('import')
  @Roles('admin')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Import tower dari Excel (format KML-style: Lat, Lng, Name, Description, IconText, IconColor)' })
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  importExcel(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new Error('File tidak ditemukan')
    return this.asetService.importFromExcel(file.buffer)
  }

  // ── Certificates ───────────────────────────────────────────────────────────
  @Get('towers/:id/sertifikat')
  @ApiOperation({ summary: 'List sertifikat untuk satu tower' })
  findCertificates(@Param('id') id: string) {
    return this.asetService.findCertificatesByTower(id)
  }

  @Post('towers/:id/sertifikat')
  @Roles('admin')
  @ApiOperation({ summary: 'Tambah sertifikat baru + upload file (admin)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('files', 10, {
    storage: diskStorage({
      destination: join(process.cwd(), 'uploads', 'sertifikat'),
      filename: (_req, file, cb) => cb(null, `${Date.now()}${extname(file.originalname)}`),
    }),
  }))
  createCertificate(
    @Param('id') id: string,
    @Body() dto: CreateAsetSertifikatDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.asetService.createCertificate(id, dto, files)
  }

  @Put('sertifikat/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update metadata sertifikat + tambah file (admin)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('files', 10, {
    storage: diskStorage({
      destination: join(process.cwd(), 'uploads', 'sertifikat'),
      filename: (_req, file, cb) => cb(null, `${Date.now()}${extname(file.originalname)}`),
    }),
  }))
  updateCertificate(
    @Param('id') id: string,
    @Body() dto: UpdateAsetSertifikatDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.asetService.updateCertificate(id, dto, files)
  }

  @Delete('sertifikat/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Hapus sertifikat (admin)' })
  removeCertificate(@Param('id') id: string) {
    return this.asetService.removeCertificate(id)
  }

  // ── Documents ──────────────────────────────────────────────────────────────
  @Get('sertifikat/dokumen/:id/preview')
  @ApiOperation({ summary: 'Preview file sertifikat' })
  async previewDokumen(@Param('id') id: string, @Res() res: Response) {
    const doc = await this.asetService.findDocument(id)
    const filePath = join(process.cwd(), doc.fileUrl)
    if (!existsSync(filePath)) return res.status(404).json({ message: 'File tidak ditemukan' })
    
    const ext = extname(doc.namaFile).toLowerCase()
    const mime = ext === '.pdf' ? 'application/pdf' : 'application/octet-stream'
    res.setHeader('Content-Type', mime)
    res.setHeader('Content-Disposition', `inline; filename="${doc.namaFile}"`)
    createReadStream(filePath).pipe(res)
  }

  @Delete('sertifikat/dokumen/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Hapus satu file dokumen dari sertifikat (admin)' })
  removeDocument(@Param('id') id: string) {
    return this.asetService.removeDocument(id)
  }
}
