import { Module } from '@nestjs/common'
import { SertifikatService } from './sertifikat.service'
import { SertifikatController } from './sertifikat.controller'

@Module({
  controllers: [SertifikatController],
  providers: [SertifikatService],
  exports: [SertifikatService],
})
export class SertifikatModule {}
