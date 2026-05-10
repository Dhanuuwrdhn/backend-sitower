import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger'
import { PegawaiService } from './pegawai.service'
import { CreatePegawaiDto } from './dto/create-pegawai.dto'
import { UpdatePegawaiDto } from './dto/update-pegawai.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'

@ApiTags('Pegawai')
@ApiBearerAuth()
@Controller('pegawai')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class PegawaiController {
  constructor(private pegawaiService: PegawaiService) {}

  @Get()
  @ApiOperation({ summary: 'List semua pegawai (admin)' })
  findAll() {
    return this.pegawaiService.findAll()
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail satu pegawai (admin)' })
  @ApiParam({ name: 'id', description: 'Pegawai ID' })
  findOne(@Param('id') id: string) {
    return this.pegawaiService.findOne(id)
  }

  @Post()
  @ApiOperation({ summary: 'Tambah pegawai baru (admin)' })
  @ApiBody({ type: CreatePegawaiDto })
  create(@Body() dto: CreatePegawaiDto) {
    return this.pegawaiService.create(dto)
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update data pegawai (admin)' })
  @ApiParam({ name: 'id', description: 'Pegawai ID' })
  @ApiBody({ type: UpdatePegawaiDto })
  update(@Param('id') id: string, @Body() dto: UpdatePegawaiDto) {
    return this.pegawaiService.update(id, dto)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hapus pegawai (admin)' })
  @ApiParam({ name: 'id', description: 'Pegawai ID' })
  remove(@Param('id') id: string) {
    return this.pegawaiService.remove(id)
  }

  @Put(':id/toggle-aktif')
  @ApiOperation({ summary: 'Toggle status aktif pegawai (admin)' })
  @ApiParam({ name: 'id', description: 'Pegawai ID' })
  toggleAktif(@Param('id') id: string) {
    return this.pegawaiService.toggleAktif(id)
  }
}
