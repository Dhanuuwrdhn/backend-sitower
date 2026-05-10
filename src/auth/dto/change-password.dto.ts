import { IsString, MinLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class ChangePasswordDto {
  @ApiProperty({ example: 'passwordLama123' })
  @IsString()
  passwordLama!: string

  @ApiProperty({ example: 'passwordBaru123', minLength: 6 })
  @IsString()
  @MinLength(6)
  passwordBaru!: string
}
