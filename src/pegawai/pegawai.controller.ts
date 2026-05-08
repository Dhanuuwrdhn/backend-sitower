import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common'
import { PegawaiService } from './pegawai.service'
import { CreatePegawaiDto } from './dto/create-pegawai.dto'
import { UpdatePegawaiDto } from './dto/update-pegawai.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'

@Controller('pegawai')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class PegawaiController {
  constructor(private pegawaiService: PegawaiService) {}

  @Get()
  findAll() {
    return this.pegawaiService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pegawaiService.findOne(id)
  }

  @Post()
  create(@Body() dto: CreatePegawaiDto) {
    return this.pegawaiService.create(dto)
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePegawaiDto) {
    return this.pegawaiService.update(id, dto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pegawaiService.remove(id)
  }

  @Put(':id/toggle-aktif')
  toggleAktif(@Param('id') id: string) {
    return this.pegawaiService.toggleAktif(id)
  }
}
