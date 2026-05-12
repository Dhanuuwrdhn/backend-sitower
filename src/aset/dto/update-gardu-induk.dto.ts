import { PartialType } from '@nestjs/swagger'
import { CreateGarduIndukDto } from './create-gardu-induk.dto'

export class UpdateGarduIndukDto extends PartialType(CreateGarduIndukDto) {}
