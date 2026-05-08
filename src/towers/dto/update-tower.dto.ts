import { PartialType, OmitType } from '@nestjs/mapped-types'
import { CreateTowerDto } from './create-tower.dto'

export class UpdateTowerDto extends PartialType(OmitType(CreateTowerDto, ['id'] as const)) {}
