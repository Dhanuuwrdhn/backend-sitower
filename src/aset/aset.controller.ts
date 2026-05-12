import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards, ParseIntPipe,
  UploadedFile, UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
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

  @Get('towers/:id')
  @ApiOperation({ summary: 'Detail tower beserta history laporan' })
  findOneTower(@Param('id') id: string) { return this.asetService.findOneTower(id) }

  @Post('towers')
  @Roles('admin')
  @ApiOperation({ summary: 'Tambah tower baru (admin)' })
  createTower(@Body() dto: CreateTowerAsetDto) { return this.asetService.createTower(dto) }

  @Put('towers/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update tower (admin)' })
  updateTower(@Param('id') id: string, @Body() dto: UpdateTowerAsetDto) {
    return this.asetService.updateTower(id, dto)
  }

  @Delete('towers/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Hapus tower (admin)' })
  removeTower(@Param('id') id: string) { return this.asetService.removeTower(id) }

  // ── Map ─────────────────────────────────────────────────────────────────────
  @Get('map/overview')
  @ApiOperation({ summary: 'Data lengkap peta: routes polyline + gardu + towers' })
  getMapOverview() { return this.asetService.getMapOverview() }

  @Get('map/routes')
  @ApiOperation({ summary: 'Polyline per jalur transmisi' })
  getMapRoutes() { return this.asetService.getMapRoutes() }

  @Get('map/filter')
  @ApiOperation({ summary: 'Filter marker peta berdasarkan jenis kerawanan' })
  @ApiQuery({ name: 'type', required: false, enum: ['semua', 'ppl', 'layangan', 'kebakaran', 'pencurian', 'pemanfaatan_lahan', 'kritis', 'sedang', 'aman'] })
  getMapFilter(@Query('type') type: string = 'semua') { return this.asetService.getMapFilter(type) }

  // ── Stats ───────────────────────────────────────────────────────────────────
  @Get('stats')
  @ApiOperation({ summary: 'Statistik aset: total, aman/sedang/kritis, per jenis kerawanan' })
  getStats() { return this.asetService.getStats() }

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
}
