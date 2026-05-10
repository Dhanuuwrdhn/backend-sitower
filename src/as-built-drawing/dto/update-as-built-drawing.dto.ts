import { PartialType } from '@nestjs/mapped-types'
import { CreateFolderDto } from './create-as-built-drawing.dto'

export class UpdateAsBuiltDrawingDto extends PartialType(CreateFolderDto) {}
