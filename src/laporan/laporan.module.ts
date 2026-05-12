import { Module } from '@nestjs/common'
import { LaporanService } from './laporan.service'
import { LaporanController } from './laporan.controller'
import { ProgressService } from './progress.service'

@Module({
  controllers: [LaporanController],
  providers: [LaporanService, ProgressService],
})
export class LaporanModule {}
