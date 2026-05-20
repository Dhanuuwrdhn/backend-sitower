import { Module } from '@nestjs/common'
import { CuiController } from './cui.controller'
import { CuiService } from './cui.service'

@Module({
  controllers: [CuiController],
  providers: [CuiService],
  exports: [CuiService],
})
export class CuiModule {}
