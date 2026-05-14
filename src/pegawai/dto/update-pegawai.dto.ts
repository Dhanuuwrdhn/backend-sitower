import { PartialType, OmitType, ApiPropertyOptional } from '@nestjs/swagger'
import { CreatePegawaiDto } from './create-pegawai.dto'
import { IsString, IsOptional, MinLength, Matches } from 'class-validator'

export class UpdatePegawaiDto extends PartialType(OmitType(CreatePegawaiDto, ['password'] as const)) {
  @ApiPropertyOptional({
    example: 'Spektra!1',
    minLength: 8,
    description: 'Min. 8 karakter, harus mengandung 1 huruf kapital dan 1 karakter spesial. Kosongkan jika tidak diubah.',
  })
  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'Password minimal 8 karakter' })
  @Matches(/[A-Z]/, { message: 'Password harus mengandung 1 huruf kapital' })
  @Matches(/[^A-Za-z0-9]/, { message: 'Password harus mengandung 1 karakter spesial' })
  password?: string
}
