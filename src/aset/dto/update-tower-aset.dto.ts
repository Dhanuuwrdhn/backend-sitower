import { PartialType, OmitType } from '@nestjs/swagger'
import { CreateTowerAsetDto } from './create-tower-aset.dto'

export class UpdateTowerAsetDto extends PartialType(OmitType(CreateTowerAsetDto, ['id'] as const)) {}
