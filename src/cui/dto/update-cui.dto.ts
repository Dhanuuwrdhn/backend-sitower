import { PartialType } from '@nestjs/swagger'
import { CreateCuiDto } from './create-cui.dto'

export class UpdateCuiDto extends PartialType(CreateCuiDto) {}
