import {
  Body, Controller, Delete, Get, Param, Patch, Post, Query, Request, UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { Roles } from '../auth/roles.decorator'
import { RolesGuard } from '../auth/roles.guard'
import { CleanupService } from './cleanup.service'
import { CreateCleanupDto } from './dto/create-cleanup.dto'
import { UpdateCleanupDto } from './dto/update-cleanup.dto'

@ApiTags('Clean Up Isolator')
@ApiBearerAuth()
@Controller('cleanup')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CleanupController {
  constructor(private cleanupService: CleanupService) {}

  @Get()
  @ApiOperation({ summary: 'List Cleanup Isolator (paginated)' })
  @ApiQuery({ name: 'search',   required: false })
  @ApiQuery({ name: 'status',   required: false, description: 'csv: selesai,sedang_berlangsung,tidak_ada_aktifitas' })
  @ApiQuery({ name: 'sirkit',   required: false, description: 'csv: sirkit_1,sirkit_2' })
  @ApiQuery({ name: 'jalur',    required: false, description: 'csv tower.jalur values' })
  @ApiQuery({ name: 'tglMulai', required: false })
  @ApiQuery({ name: 'tglAkhir', required: false })
  @ApiQuery({ name: 'page',     required: false })
  @ApiQuery({ name: 'limit',    required: false })
  findAll(@Query() query: { search?: string; status?: string; sirkit?: string; jalur?: string; tglMulai?: string; tglAkhir?: string; page?: string; limit?: string }) {
    return this.cleanupService.findAll({
      search: query.search,
      status: query.status,
      sirkit: query.sirkit,
      jalur: query.jalur,
      tglMulai: query.tglMulai,
      tglAkhir: query.tglAkhir,
      page: query.page ? Number(query.page) : undefined,
      limit: query.limit ? Number(query.limit) : undefined,
    })
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail Cleanup' })
  findOne(@Param('id') id: string) {
    return this.cleanupService.findOne(id)
  }

  @Post()
  @ApiOperation({ summary: 'Buat Cleanup (teknisi & admin)' })
  create(@Body() dto: CreateCleanupDto, @Request() req: any) {
    return this.cleanupService.create(dto, req.user)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update Cleanup (teknisi & admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateCleanupDto) {
    return this.cleanupService.update(id, dto)
  }

  @Delete(':id')
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'Hapus Cleanup (admin only)' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.cleanupService.remove(id, req.user)
  }
}
