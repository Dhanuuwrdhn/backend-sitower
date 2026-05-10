import { PartialType } from '@nestjs/swagger'
import { CreateFolderDto } from './create-sertifikat.dto'

export class UpdateSertifikatDto extends PartialType(CreateFolderDto) {}
