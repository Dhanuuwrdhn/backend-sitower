import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger'
import { TowersService } from './towers.service'
import { CreateTowerDto } from './dto/create-tower.dto'
import { UpdateTowerDto } from './dto/update-tower.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'

@ApiTags('Towers')
@ApiBearerAuth()
@Controller('towers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TowersController {
  constructor(private towersService: TowersService) {}

  @Get()
  @ApiOperation({ summary: 'List semua tower dengan filter' })
  @ApiQuery({ name: 'tipe',    required: false, enum: ['SUTET','SUTT','SKTT','garduInduk'] })
  @ApiQuery({ name: 'kondisi', required: false, enum: ['baik','sedang','buruk'] })
  @ApiQuery({ name: 'search',  required: false })
  @ApiQuery({ name: 'page',    required: false })
  @ApiQuery({ name: 'limit',   required: false })
  findAll(@Query() query: { tipe?: string; kondisi?: string; search?: string; page?: string; limit?: string }) {
    return this.towersService.findAll(query)
  }

  @Get('map')
  @ApiOperation({ summary: 'Data tower untuk peta (koordinat + kondisi)' })
  findAllForMap() {
    return this.towersService.findAllForMap()
  }

  @Get('dropdown')
  @ApiOperation({ summary: 'Dropdown tower (id, nomorTower, garduInduk, tipe, koordinat, radius)' })
  findAllForDropdown() {
    return this.towersService.findAllForDropdown()
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail satu tower' })
  @ApiParam({ name: 'id', description: 'Tower ID (e.g. T-23)' })
  findOne(@Param('id') id: string) {
    return this.towersService.findOne(id)
  }

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Tambah tower baru (admin)' })
  @ApiBody({ type: CreateTowerDto })
  create(@Body() dto: CreateTowerDto) {
    return this.towersService.create(dto)
  }

  @Put(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update data tower (admin)' })
  @ApiParam({ name: 'id', description: 'Tower ID' })
  @ApiBody({ type: UpdateTowerDto })
  update(@Param('id') id: string, @Body() dto: UpdateTowerDto) {
    return this.towersService.update(id, dto)
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Hapus tower (admin)' })
  @ApiParam({ name: 'id', description: 'Tower ID' })
  remove(@Param('id') id: string) {
    return this.towersService.remove(id)
  }
}
