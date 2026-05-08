import { Controller, Post, Param, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ImportService } from './import.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'

@Controller('import')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class ImportController {
  constructor(private importService: ImportService) {}

  @Post(':type')
  @UseInterceptors(FileInterceptor('file'))
  importFile(@Param('type') type: string, @UploadedFile() file: Express.Multer.File) {
    return this.importService.importFile(type, file.buffer)
  }
}
