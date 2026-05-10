import { IsString, IsOptional, IsDateString, IsIn } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateFolderDto {
  @ApiProperty({ example: 'Sertifikat Kelayakan Tower T-23' })
  @IsString()
  nama!: string

  @ApiProperty({ enum: ['Kelayakan', 'Grounding', 'Konstruksi', 'K3', 'Lingkungan'], example: 'Kelayakan' })
  @IsString()
  @IsIn(['Kelayakan', 'Grounding', 'Konstruksi', 'K3', 'Lingkungan'])
  kategori!: string

  @ApiPropertyOptional({ enum: ['berlaku', 'expired'], example: 'berlaku' })
  @IsOptional()
  @IsString()
  @IsIn(['berlaku', 'expired'])
  status?: string

  @ApiPropertyOptional({ example: 'T-23', description: 'ID tower (opsional)' })
  @IsOptional()
  @IsString()
  towerId?: string

  @ApiPropertyOptional({ example: '2027-12-31', description: 'Tanggal berlaku hingga (ISO date)' })
  @IsOptional()
  @IsDateString()
  berlakuHingga?: string
}

export class CreateSertifikatDto extends CreateFolderDto {}
