import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  UseGuards, UseInterceptors, UploadedFile,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname, join } from 'path'
import { AsBuiltDrawingService } from './as-built-drawing.service'
import { CreateAsBuiltDrawingDto } from './dto/create-as-built-drawing.dto'
import { UpdateAsBuiltDrawingDto } from './dto/update-as-built-drawing.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'

@Controller('as-built-drawing')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AsBuiltDrawingController {
  constructor(private asBuiltDrawingService: AsBuiltDrawingService) {}

  @Get()
  findAll(@Query() query: { towerId?: string; tipe?: string; tahun?: number }) {
    return this.asBuiltDrawingService.findAll(query)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.asBuiltDrawingService.findOne(id)
  }

  @Post()
  @Roles('admin')
  create(@Body() dto: CreateAsBuiltDrawingDto) {
    return this.asBuiltDrawingService.create(dto)
  }

  @Put(':id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() dto: UpdateAsBuiltDrawingDto) {
    return this.asBuiltDrawingService.update(id, dto)
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.asBuiltDrawingService.remove(id)
  }

  @Post(':id/upload')
  @Roles('admin')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads', 'asbuilt'),
        filename: (req, file, cb) => cb(null, `${Date.now()}${extname(file.originalname)}`),
      }),
    }),
  )
  uploadFile(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    return this.asBuiltDrawingService.updateFileUrl(id, `/uploads/asbuilt/${file.filename}`)
  }
}
