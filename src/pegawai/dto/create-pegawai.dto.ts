import { IsString, IsOptional, IsBoolean, MinLength } from 'class-validator'
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

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password!: string

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  aktif?: boolean

  @ApiPropertyOptional({ example: 'https://example.com/foto.jpg' })
  @IsOptional()
  @IsString()
  foto?: string
}
