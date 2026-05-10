import { IsString, IsNumber, IsOptional, IsIn } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateFolderDto {
  @ApiProperty({ example: 'Drawing Tower T-23 2024' })
  @IsString()
  nama!: string

  @ApiProperty({ enum: ['Electrical', 'Mechanical', 'Civil', 'Grounding', 'Lainnya'], example: 'Electrical' })
  @IsString()
  @IsIn(['Electrical', 'Mechanical', 'Civil', 'Grounding', 'Lainnya'])
  tipe!: string

  @ApiProperty({ example: 2024 })
  @IsNumber()
  @Type(() => Number)
  tahun!: number

  @ApiPropertyOptional({ example: 'T-23', description: 'ID tower (opsional)' })
  @IsOptional()
  @IsString()
  towerId?: string

  @ApiPropertyOptional({ example: 'Drawing hasil revisi 2024' })
  @IsOptional()
  @IsString()
  keterangan?: string
}

export class CreateAsBuiltDrawingDto extends CreateFolderDto {}
