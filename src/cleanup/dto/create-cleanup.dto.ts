import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsDateString, IsIn, IsOptional, IsString } from 'class-validator'

export const CLEANUP_STATUSES = ['selesai', 'sedang_berlangsung', 'tidak_ada_aktifitas'] as const
export const CLEANUP_SIRKITS  = ['sirkit_1', 'sirkit_2'] as const
export type CleanupStatus = (typeof CLEANUP_STATUSES)[number]
export type CleanupSirkit = (typeof CLEANUP_SIRKITS)[number]

export class CreateCleanupDto {
  @ApiProperty({ description: 'Tower ID (penghantar diturunkan dari tower)' })
  @IsString()
  towerId!: string

  @ApiProperty({ enum: CLEANUP_SIRKITS, default: 'sirkit_1' })
  @IsIn(CLEANUP_SIRKITS as unknown as string[])
  sirkit!: CleanupSirkit

  @ApiProperty({ description: 'Tanggal pelaksanaan (ISO date)' })
  @IsDateString()
  tanggal!: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  keterangan?: string

  @ApiPropertyOptional({ enum: CLEANUP_STATUSES, default: 'sedang_berlangsung' })
  @IsOptional()
  @IsIn(CLEANUP_STATUSES as unknown as string[])
  status?: CleanupStatus
}
