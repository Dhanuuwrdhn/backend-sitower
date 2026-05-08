import { PartialType } from '@nestjs/mapped-types'
import { CreateAsBuiltDrawingDto } from './create-as-built-drawing.dto'

export class UpdateAsBuiltDrawingDto extends PartialType(CreateAsBuiltDrawingDto) {}
