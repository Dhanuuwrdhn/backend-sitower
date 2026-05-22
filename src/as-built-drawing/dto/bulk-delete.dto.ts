import { IsArray, IsString } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class BulkDeleteDto {
  @ApiPropertyOptional({ type: [String], description: 'ID folder yang akan dihapus (cascade ke subfolder & dokumen)' })
  @IsArray()
  @IsString({ each: true })
  folderIds: string[] = []

  @ApiPropertyOptional({ type: [String], description: 'ID dokumen yang akan dihapus' })
  @IsArray()
  @IsString({ each: true })
  dokumenIds: string[] = []
}
