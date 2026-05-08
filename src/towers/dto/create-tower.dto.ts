import { IsString, IsNumber, IsOptional } from 'class-validator'

export class CreateTowerDto {
  @IsString()
  id: string

  @IsString()
  nama: string

  @IsNumber()
  lat: number

  @IsNumber()
  lng: number

  @IsString()
  tegangan: string

  @IsString()
  tipe: string

  @IsOptional()
  @IsString()
  kondisi?: string

  @IsOptional()
  @IsString()
  lokasi?: string
}
