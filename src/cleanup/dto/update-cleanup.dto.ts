import { PartialType } from '@nestjs/swagger'
import { CreateCleanupDto } from './create-cleanup.dto'

export class UpdateCleanupDto extends PartialType(CreateCleanupDto) {}
