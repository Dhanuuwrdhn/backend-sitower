import { Module } from '@nestjs/common'
import { JalurKmlController } from './jalur-kml.controller'
import { JalurKmlService } from './jalur-kml.service'

@Module({ controllers: [JalurKmlController], providers: [JalurKmlService] })
export class JalurKmlModule {}
