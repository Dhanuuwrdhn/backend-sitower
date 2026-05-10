import { IsString, IsOptional, IsArray, IsDateString } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateLaporanDto {
  @ApiProperty({ example: 'T-23' })
  @IsString()
  towerId!: string

  @ApiProperty({ example: 'pekerjaan_pihak_lain', enum: ['pekerjaan_pihak_lain','kebakaran','layangan','pencurian','pemanfaatan_lahan','gangguan','span','cui','cleanup'] })
  @IsString()
  jenisGangguan!: string

  @ApiProperty({ example: 'Ditemukan aktivitas pihak lain di sekitar tower' })
  @IsString()
  deskripsi!: string

  @ApiProperty({ example: 'sedang', enum: ['tinggi', 'sedang', 'rendah'] })
  @IsString()
  levelRisiko!: string

  @ApiPropertyOptional({ example: 'berlangsung', enum: ['berlangsung', 'selesai', 'tidak_ada_aktifitas'] })
  @IsString()
  @IsOptional()
  status?: string

  @ApiProperty({ example: '2025-05-10T08:30:00.000Z' })
  @IsDateString()
  tanggal!: string

  @ApiPropertyOptional({ example: 'Kec. Cikupa, dekat jalan raya' })
  @IsString()
  @IsOptional()
  lokasiDetail?: string

  @ApiPropertyOptional({ example: 'Catatan tambahan laporan' })
  @IsString()
  @IsOptional()
  keterangan?: string

  @ApiPropertyOptional({ type: [String], example: ['https://example.com/foto1.jpg'] })
  @IsArray()
  @IsOptional()
  foto?: string[]

  @ApiPropertyOptional({ example: 'SPK-2025-001' })
  @IsString()
  @IsOptional()
  noSpk?: string

  @ApiPropertyOptional({ example: 'Budi Santoso' })
  @IsString()
  @IsOptional()
  teknisi?: string

  @ApiPropertyOptional({ example: 'Korosi pada badan tower' })
  @IsString()
  @IsOptional()
  temuan?: string

  @ApiPropertyOptional({ example: 'Pengecatan ulang selesai' })
  @IsString()
  @IsOptional()
  hasil?: string

  @ApiPropertyOptional({ example: 'Sambaran petir langsung' })
  @IsString()
  @IsOptional()
  penyebab?: string

  @ApiPropertyOptional({ example: '3.5' })
  @IsString()
  @IsOptional()
  durasi?: string

  @ApiPropertyOptional({ example: 'Pembersihan semak' })
  @IsString()
  @IsOptional()
  jenisCleanup?: string
}
