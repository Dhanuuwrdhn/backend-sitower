import { IsString, IsNumber, IsOptional, IsInt } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateTowerAsetDto {
  @ApiProperty({ example: 'TX9' })
  @IsString()
  id!: string

  @ApiProperty({ example: 'SUTT KEMBANGAN - PETUKANGAN TOWER TX9' })
  @IsString()
  nama!: string

  @ApiProperty({ example: -6.1922835 })
  @IsNumber()
  lat!: number

  @ApiProperty({ example: 106.7310592 })
  @IsNumber()
  lng!: number

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  routeId?: number

  @ApiPropertyOptional({ example: 'aman', enum: ['aman', 'sedang', 'kritis'] })
  @IsOptional()
  @IsString()
  statusKerawanan?: string

  @ApiPropertyOptional({ example: 'ppl', enum: ['ppl', 'layangan', 'kebakaran', 'pencurian', 'pemanfaatan_lahan'] })
  @IsOptional()
  @IsString()
  jenisKerawanan?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pplNotes?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  penanggungJawab?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  telepon?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sertifikatLink?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lokasi?: string
}
