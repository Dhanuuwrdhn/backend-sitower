import { IsString, IsInt } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateRouteDto {
  @ApiProperty({ example: 'SUTT KEMBANGAN - PETUKANGAN' })
  @IsString()
  nama!: string

  @ApiProperty({ example: 1, description: 'ID TransmissionLineType' })
  @IsInt()
  lineTypeId!: number

  @ApiProperty({ example: 1, description: 'ID GarduInduk asal' })
  @IsInt()
  garduDariId!: number

  @ApiProperty({ example: 2, description: 'ID GarduInduk tujuan' })
  @IsInt()
  garduKeId!: number
}
