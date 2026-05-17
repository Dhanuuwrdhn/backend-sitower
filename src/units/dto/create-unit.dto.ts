import { IsString, MinLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateUnitDto {
  @ApiProperty({ example: 'UPT Durikosambi' })
  @IsString()
  @MinLength(1, { message: 'Nama unit wajib diisi' })
  nama!: string
}
