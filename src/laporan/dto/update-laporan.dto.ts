import { PartialType } from '@nestjs/mapped-types'
import { CreateLaporanDto } from './create-laporan.dto'

export class UpdateLaporanDto extends PartialType(CreateLaporanDto) {}
