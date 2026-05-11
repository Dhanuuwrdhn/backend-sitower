import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { JalurKmlService } from './jalur-kml.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'

@Controller('jalur-kml')
@UseGuards(JwtAuthGuard)
export class JalurKmlController {
  constructor(private readonly jalurKmlService: JalurKmlService) {}

  /** POST /jalur-kml/upload — upload & parse KML file (admin only) */
  @Post('upload')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('file'))
  async uploadKml(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File KML tidak ditemukan')
    }

    const ext = file.originalname.toLowerCase()
    if (!ext.endsWith('.kml')) {
      throw new BadRequestException('Hanya file .kml yang diperbolehkan')
    }

    const result = await this.jalurKmlService.parseAndSave(file.buffer, file.originalname)

    return {
      message: `${result.total} jalur berhasil diimport dari KML`,
      data: result,
    }
  }

  /** GET /jalur-kml — ambil semua jalur */
  @Get()
  async findAll() {
    const data = await this.jalurKmlService.findAll()
    return { data }
  }

  /** DELETE /jalur-kml/:id — hapus jalur (admin only) */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.jalurKmlService.remove(id)
    return { message: 'Jalur berhasil dihapus' }
  }
}
