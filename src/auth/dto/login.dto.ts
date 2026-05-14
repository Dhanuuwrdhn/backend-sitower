import { IsString, MinLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class LoginDto {
  @ApiProperty({
    example: '1234567890123456',
    description: 'NIK (16-digit) atau username. Sistem akan cocokkan ke salah satu.',
  })
  @IsString()
  nik!: string

  @ApiProperty({ example: 'Aa1!aaaa', minLength: 6 })
  @IsString()
  @MinLength(6)
  password!: string
}
