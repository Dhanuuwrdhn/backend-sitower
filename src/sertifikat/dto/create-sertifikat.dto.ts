import { IsString, IsOptional, IsDateString } from 'class-validator'

export class CreateSertifikatDto {
  @IsString()
  towerId: string

  @IsString()
  tipe: string

  @IsString()
  nama: string

  @IsDateString()
  berlakuHingga: string

  @IsString()
  status: string

  @IsOptional()
  @IsString()
  fileUrl?: string
}
