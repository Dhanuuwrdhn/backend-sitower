import { PartialType, OmitType } from '@nestjs/mapped-types'
import { CreatePegawaiDto } from './create-pegawai.dto'

export class UpdatePegawaiDto extends PartialType(OmitType(CreatePegawaiDto, ['password'] as const)) {
  password?: string
}
