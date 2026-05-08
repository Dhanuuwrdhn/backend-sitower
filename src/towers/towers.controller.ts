import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { TowersService } from './towers.service'
import { CreateTowerDto } from './dto/create-tower.dto'
import { UpdateTowerDto } from './dto/update-tower.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'

@Controller('towers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TowersController {
  constructor(private towersService: TowersService) {}

  @Get()
  findAll(@Query() query: { tipe?: string; kondisi?: string; search?: string; page?: string; limit?: string }) {
    return this.towersService.findAll(query)
  }

  @Get('map')
  findAllForMap() {
    return this.towersService.findAllForMap()
  }

  @Get('dropdown')
  findAllForDropdown() {
    return this.towersService.findAllForDropdown()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.towersService.findOne(id)
  }

  @Post()
  @Roles('admin')
  create(@Body() dto: CreateTowerDto) {
    return this.towersService.create(dto)
  }

  @Put(':id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() dto: UpdateTowerDto) {
    return this.towersService.update(id, dto)
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.towersService.remove(id)
  }
}
