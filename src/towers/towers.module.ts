import { Module } from '@nestjs/common'
import { TowersService } from './towers.service'
import { TowersController } from './towers.controller'

@Module({
  controllers: [TowersController],
  providers: [TowersService],
  exports: [TowersService],
})
export class TowersModule {}
