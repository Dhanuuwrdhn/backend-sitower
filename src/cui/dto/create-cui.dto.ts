import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsDateString, IsIn, IsOptional, IsString } from 'class-validator'

export const CUI_STATUSES = ['selesai', 'sedang_berlangsung', 'tidak_ada_aktifitas'] as const
export type CuiStatus = (typeof CUI_STATUSES)[number]

export class CreateCuiDto {
  @ApiProperty({ description: 'Tower ID (penghantar diturunkan dari tower.route.nama)' })
  @IsString()
  towerId!: string

  @ApiProperty({ description: 'Tanggal inspeksi (ISO date)' })
  @IsDateString()
  tanggal!: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  keterangan?: string

  @ApiPropertyOptional({ enum: CUI_STATUSES, default: 'sedang_berlangsung' })
  @IsOptional()
  @IsIn(CUI_STATUSES as unknown as string[])
  status?: CuiStatus
}
