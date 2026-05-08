import { IsString, IsOptional, IsArray, IsDateString } from 'class-validator'

export class CreateLaporanDto {
  @IsString()
  towerId: string

  @IsString()
  jenisGangguan: string

  @IsString()
  deskripsi: string

  @IsString()
  levelRisiko: string

  @IsString()
  @IsOptional()
  status?: string

  @IsDateString()
  tanggal: string

  @IsString()
  @IsOptional()
  lokasiDetail?: string

  @IsString()
  @IsOptional()
  keterangan?: string

  @IsArray()
  @IsOptional()
  foto?: string[]

  @IsString()
  @IsOptional()
  noSpk?: string

  @IsString()
  @IsOptional()
  teknisi?: string

  @IsString()
  @IsOptional()
  temuan?: string

  @IsString()
  @IsOptional()
  hasil?: string

  @IsString()
  @IsOptional()
  penyebab?: string

  @IsString()
  @IsOptional()
  durasi?: string

  // Bidang tambahan dari cleanup
  @IsString()
  @IsOptional()
  jenisCleanup?: string
}
