import { IsString, IsNumber, IsOptional, IsInt, IsBoolean } from 'class-validator'
import { Type, Transform } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateTowerAsetDto {
  @ApiProperty({ example: 'SUTT KEMBANGAN - PETUKANGAN TOWER TX9' })
  @IsString()
  nama!: string

  @ApiProperty({ example: -6.1922835 })
  @Type(() => Number)
  @IsNumber()
  lat!: number

  @ApiProperty({ example: 106.7310592 })
  @Type(() => Number)
  @IsNumber()
  lng!: number

  @ApiPropertyOptional({ example: '150kV' })
  @IsOptional()
  @IsString()
  tegangan?: string

  @ApiPropertyOptional({ example: 'SUTT' })
  @IsOptional()
  @IsString()
  tipe?: string

  @ApiPropertyOptional({ example: 'normal' })
  @IsOptional()
  @IsString()
  kondisi?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lokasi?: string

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  radius?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jalur?: string

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => value === '' ? null : value)
  @Type(() => Number)
  @IsInt()
  nomorUrut?: number

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Transform(({ value }) => value === '' ? null : value)
  @Type(() => Number)
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

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  hasCertificate?: boolean
}
