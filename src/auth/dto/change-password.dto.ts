import { IsString, MinLength } from 'class-validator'

export class ChangePasswordDto {
  @IsString()
  passwordLama: string

  @IsString()
  @MinLength(6)
  passwordBaru: string
}
