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
  jalur?: string

  @IsOptional()
  @IsString()
  teknisi?: string

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

  // When 'true' (or '1'), restricts the list to the calling user's own
  // laporan. Used by the dashboard "recent" table for teknisi while the
  // main Riwayat page leaves it unset to show everyone's reports.
  @IsOptional()
  @IsString()
  mine?: string
}
