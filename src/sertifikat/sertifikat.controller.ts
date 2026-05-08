import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  UseGuards, UseInterceptors, UploadedFile,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname, join } from 'path'
import { SertifikatService } from './sertifikat.service'
import { CreateSertifikatDto } from './dto/create-sertifikat.dto'
import { UpdateSertifikatDto } from './dto/update-sertifikat.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'

@Controller('sertifikat')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SertifikatController {
  constructor(private sertifikatService: SertifikatService) {}

  @Get()
  findAll(@Query() query: { towerId?: string; status?: string; tipe?: string }) {
    return this.sertifikatService.findAll(query)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sertifikatService.findOne(id)
  }

  @Post()
  @Roles('admin')
  create(@Body() dto: CreateSertifikatDto) {
    return this.sertifikatService.create(dto)
  }

  @Put(':id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() dto: UpdateSertifikatDto) {
    return this.sertifikatService.update(id, dto)
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.sertifikatService.remove(id)
  }

  @Post(':id/upload')
  @Roles('admin')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads', 'sertifikat'),
        filename: (req, file, cb) => cb(null, `${Date.now()}${extname(file.originalname)}`),
      }),
    }),
  )
  uploadFile(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    return this.sertifikatService.updateFileUrl(id, `/uploads/sertifikat/${file.filename}`)
  }
}
