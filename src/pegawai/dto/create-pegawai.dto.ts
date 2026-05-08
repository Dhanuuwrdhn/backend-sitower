import { IsString, IsOptional, IsBoolean, MinLength } from 'class-validator'

export class CreatePegawaiDto {
  @IsString()
  nik: string

  @IsString()
  nama: string

  @IsString()
  jabatan: string

  @IsString()
  unit: string

  @IsOptional()
  @IsString()
  role?: string

  @IsString()
  @MinLength(6)
  password: string

  @IsOptional()
  @IsBoolean()
  aktif?: boolean

  @IsOptional()
  @IsString()
  foto?: string
}
