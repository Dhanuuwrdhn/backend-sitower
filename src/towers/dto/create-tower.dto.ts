import { IsString, IsNumber, IsOptional } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateTowerDto {
  @ApiProperty({ example: 'T-23' })
  @IsString()
  id!: string

  @ApiProperty({ example: 'Tower Cikupa–Balaraja' })
  @IsString()
  nama!: string

  @ApiProperty({ example: -6.2123 })
  @IsNumber()
  lat!: number

  @ApiProperty({ example: 106.7654 })
  @IsNumber()
  lng!: number

  @ApiProperty({ example: '150kV', description: 'Tegangan tower' })
  @IsString()
  tegangan!: string

  @ApiProperty({ example: 'SUTET', enum: ['SUTET', 'SUTT', 'SKTT', 'garduInduk'] })
  @IsString()
  tipe!: string

  @ApiPropertyOptional({ example: 'baik', enum: ['baik', 'sedang', 'buruk'] })
  @IsOptional()
  @IsString()
  kondisi?: string

  @ApiPropertyOptional({ example: 'Kec. Cikupa, Tangerang' })
  @IsOptional()
  @IsString()
  lokasi?: string

  @ApiPropertyOptional({ example: 100, description: 'Radius deteksi dalam meter' })
  @IsOptional()
  @IsNumber()
  radius?: number
}
