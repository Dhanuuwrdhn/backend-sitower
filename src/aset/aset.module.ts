import { Module } from '@nestjs/common'
import { AsetController } from './aset.controller'
import { AsetService } from './aset.service'

@Module({
  controllers: [AsetController],
  providers:   [AsetService],
  exports:     [AsetService],
})
export class AsetModule {}
