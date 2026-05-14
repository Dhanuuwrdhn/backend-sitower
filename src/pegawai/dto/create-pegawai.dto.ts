import { IsString, IsOptional, IsBoolean, IsDateString, MinLength, Matches } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreatePegawaiDto {
  @ApiProperty({ example: '199001010001' })
  @IsString()
  nik!: string

  @ApiProperty({ example: 'Budi Santoso' })
  @IsString()
  nama!: string

  @ApiProperty({ example: 'Teknisi Jaringan' })
  @IsString()
  jabatan!: string

  @ApiProperty({ example: 'UIW Banten' })
  @IsString()
  unit!: string

  @ApiPropertyOptional({ example: 'teknisi', enum: ['admin', 'teknisi', 'viewer'] })
  @IsOptional()
  @IsString()
  role?: string

  @ApiProperty({
    example: 'Spektra!1',
    minLength: 8,
    description: 'Min. 8 karakter, harus mengandung 1 huruf kapital dan 1 karakter spesial.',
  })
  @IsString()
  @MinLength(8, { message: 'Password minimal 8 karakter' })
  @Matches(/[A-Z]/, { message: 'Password harus mengandung 1 huruf kapital' })
  @Matches(/[^A-Za-z0-9]/, { message: 'Password harus mengandung 1 karakter spesial' })
  password!: string

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  aktif?: boolean

  @ApiPropertyOptional({ example: 'https://example.com/foto.jpg' })
  @IsOptional()
  @IsString()
  foto?: string

  @ApiPropertyOptional({ example: '2026-12-31T23:59:59.000Z', description: 'Tanggal akun kedaluwarsa (superadmin only)' })
  @IsOptional()
  @IsDateString()
  expiredAt?: string
}
