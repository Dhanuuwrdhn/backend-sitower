import { IsString, MinLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class RequestChangePasswordDto {
  @ApiProperty({ example: 'passwordLama123' })
  @IsString()
  passwordLama!: string

  @ApiProperty({ example: 'passwordBaru456', minLength: 6 })
  @IsString()
  @MinLength(6)
  passwordBaru!: string

  @ApiProperty({ example: 'passwordBaru456' })
  @IsString()
  @MinLength(6)
  konfirmasiPasswordBaru!: string
}
