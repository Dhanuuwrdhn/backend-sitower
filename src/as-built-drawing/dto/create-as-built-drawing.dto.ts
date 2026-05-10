import { IsString, IsNumber, IsOptional, IsIn } from 'class-validator'
import { Type } from 'class-transformer'

export class CreateFolderDto {
  @IsString()
  nama: string

  @IsString()
  @IsIn(['Electrical', 'Mechanical', 'Civil', 'Grounding', 'Lainnya'])
  tipe: string

  @IsNumber()
  @Type(() => Number)
  tahun: number

  @IsOptional()
  @IsString()
  towerId?: string

  @IsOptional()
  @IsString()
  keterangan?: string
}

export class CreateAsBuiltDrawingDto extends CreateFolderDto {}
