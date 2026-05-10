import { PartialType } from '@nestjs/swagger'
import { CreateFolderDto } from './create-as-built-drawing.dto'

export class UpdateAsBuiltDrawingDto extends PartialType(CreateFolderDto) {}
