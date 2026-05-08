import { IsString, MinLength } from 'class-validator'

export class LoginDto {
  @IsString()
  nik: string

  @IsString()
  @MinLength(6)
  password: string
}
