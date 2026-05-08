import { Module } from '@nestjs/common'
import { AsBuiltDrawingService } from './as-built-drawing.service'
import { AsBuiltDrawingController } from './as-built-drawing.controller'

@Module({
  controllers: [AsBuiltDrawingController],
  providers: [AsBuiltDrawingService],
  exports: [AsBuiltDrawingService],
})
export class AsBuiltDrawingModule {}
