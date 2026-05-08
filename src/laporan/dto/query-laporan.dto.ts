import { IsOptional, IsString, IsNumberString } from 'class-validator'

export class QueryLaporanDto {
  @IsOptional()
  @IsString()
  search?: string

  @IsOptional()
  @IsString()
  jenisGangguan?: string

  @IsOptional()
  @IsString()
  status?: string

  @IsOptional()
  @IsString()
  levelRisiko?: string

  @IsOptional()
  @IsString()
  towerId?: string

  @IsOptional()
  @IsString()
  tglMulai?: string

  @IsOptional()
  @IsString()
  tglAkhir?: string

  @IsOptional()
  @IsNumberString()
  page?: string

  @IsOptional()
  @IsNumberString()
  limit?: string
}
