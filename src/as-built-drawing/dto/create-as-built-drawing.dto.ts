import { IsString, IsNumber, IsOptional } from 'class-validator'

export class CreateAsBuiltDrawingDto {
  @IsString()
  towerId: string

  @IsString()
  namaFile: string

  @IsString()
  tipe: string

  @IsNumber()
  tahun: number

  @IsOptional()
  @IsString()
  versi?: string

  @IsOptional()
  @IsString()
  fileUrl?: string

  @IsOptional()
  @IsString()
  keterangan?: string
}
