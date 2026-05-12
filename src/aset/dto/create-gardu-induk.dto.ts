import { IsString, IsNumber } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateGarduIndukDto {
  @ApiProperty({ example: 'KBG' })
  @IsString()
  kode!: string

  @ApiProperty({ example: 'GI Kembangan' })
  @IsString()
  nama!: string

  @ApiProperty({ example: -6.188 })
  @IsNumber()
  lat!: number

  @ApiProperty({ example: 106.72 })
  @IsNumber()
  lng!: number

  @ApiProperty({ example: '150kV' })
  @IsString()
  tegangan!: string
}
