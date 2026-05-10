import { Controller, Post, Get, Param, UseGuards, UseInterceptors, UploadedFile, Res } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { Response } from 'express'
import { ImportService } from './import.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'

@Controller('import')
export class ImportController {
  constructor(private importService: ImportService) {}

  /** Download template Excel untuk import tower — no auth required */
  @Get('template/towers')
  async downloadTowerTemplate(@Res() res: Response) {
    const buffer = await this.importService.generateTowerTemplate()
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="template-import-tower.xlsx"',
      'Content-Length': buffer.length,
    })
    res.end(buffer)
  }

  @Post(':type')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('file'))
  importFile(@Param('type') type: string, @UploadedFile() file: Express.Multer.File) {
    return this.importService.importFile(type, file.buffer)
  }
}
