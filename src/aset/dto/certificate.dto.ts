import { IsString, IsOptional, IsDateString, IsIn } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateAsetSertifikatDto {
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

  @ApiPropertyOptional({ example: '2027-12-31', description: 'Tanggal berlaku hingga (ISO date)' })
  @IsOptional()
  @IsDateString()
  berlakuHingga?: string
}

export class UpdateAsetSertifikatDto {
  @ApiPropertyOptional({ example: 'Sertifikat Kelayakan Tower T-23' })
  @IsOptional()
  @IsString()
  nama?: string

  @ApiPropertyOptional({ enum: ['Kelayakan', 'Grounding', 'Konstruksi', 'K3', 'Lingkungan'], example: 'Kelayakan' })
  @IsOptional()
  @IsString()
  @IsIn(['Kelayakan', 'Grounding', 'Konstruksi', 'K3', 'Lingkungan'])
  kategori?: string

  @ApiPropertyOptional({ enum: ['berlaku', 'expired'], example: 'berlaku' })
  @IsOptional()
  @IsString()
  @IsIn(['berlaku', 'expired'])
  status?: string

  @ApiPropertyOptional({ example: '2027-12-31', description: 'Tanggal berlaku hingga (ISO date)' })
  @IsOptional()
  @IsDateString()
  berlakuHingga?: string
}
