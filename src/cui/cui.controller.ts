import {
  Body, Controller, Delete, Get, Param, Patch, Post, Query, Request, UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { Roles } from '../auth/roles.decorator'
import { RolesGuard } from '../auth/roles.guard'
import { CuiService } from './cui.service'
import { CreateCuiDto } from './dto/create-cui.dto'
import { UpdateCuiDto } from './dto/update-cui.dto'

@ApiTags('Climb Up Inspection')
@ApiBearerAuth()
@Controller('cui')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CuiController {
  constructor(private cuiService: CuiService) {}

  @Get()
  @ApiOperation({ summary: 'List CUI (paginated)' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', required: false, enum: ['selesai', 'sedang_berlangsung', 'tidak_ada_aktifitas'] })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAll(@Query() query: { search?: string; status?: string; page?: string; limit?: string }) {
    return this.cuiService.findAll({
      search: query.search,
      status: query.status,
      page: query.page ? Number(query.page) : undefined,
      limit: query.limit ? Number(query.limit) : undefined,
    })
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail CUI' })
  findOne(@Param('id') id: string) {
    return this.cuiService.findOne(id)
  }

  @Post()
  @ApiOperation({ summary: 'Buat CUI (teknisi & admin)' })
  create(@Body() dto: CreateCuiDto, @Request() req: any) {
    return this.cuiService.create(dto, req.user)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update CUI (teknisi & admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateCuiDto) {
    return this.cuiService.update(id, dto)
  }

  @Delete(':id')
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'Hapus CUI (admin only)' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.cuiService.remove(id, req.user)
  }
}
