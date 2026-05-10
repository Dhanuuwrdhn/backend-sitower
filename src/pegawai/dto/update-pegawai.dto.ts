import { PartialType, OmitType, ApiPropertyOptional } from '@nestjs/swagger'
import { CreatePegawaiDto } from './create-pegawai.dto'
import { IsString, IsOptional, MinLength } from 'class-validator'

export class UpdatePegawaiDto extends PartialType(OmitType(CreatePegawaiDto, ['password'] as const)) {
  @ApiPropertyOptional({ example: 'newpassword123', minLength: 6 })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string
}
