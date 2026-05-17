import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger'
import { UnitsService } from './units.service'
import { CreateUnitDto } from './dto/create-unit.dto'
import { UpdateUnitDto } from './dto/update-unit.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'

@ApiTags('Units')
@ApiBearerAuth()
@Controller('units')
@UseGuards(JwtAuthGuard)
export class UnitsController {
  constructor(private unitsService: UnitsService) {}

  @Get()
  @ApiOperation({ summary: 'List semua unit' })
  findAll() {
    return this.unitsService.findAll()
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Tambah unit baru (admin)' })
  @ApiBody({ type: CreateUnitDto })
  create(@Body() dto: CreateUnitDto) {
    return this.unitsService.create(dto)
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update unit (admin)' })
  @ApiParam({ name: 'id', description: 'Unit ID' })
  @ApiBody({ type: UpdateUnitDto })
  update(@Param('id') id: string, @Body() dto: UpdateUnitDto) {
    return this.unitsService.update(id, dto)
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Hapus unit (admin)' })
  @ApiParam({ name: 'id', description: 'Unit ID' })
  remove(@Param('id') id: string) {
    return this.unitsService.remove(id)
  }
}
