import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './auth/auth.module'
import { TowersModule } from './towers/towers.module'
import { LaporanModule } from './laporan/laporan.module'
import { SertifikatModule } from './sertifikat/sertifikat.module'
import { AsBuiltDrawingModule } from './as-built-drawing/as-built-drawing.module'
import { PegawaiModule } from './pegawai/pegawai.module'
import { ImportModule } from './import/import.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    TowersModule,
    LaporanModule,
    SertifikatModule,
    AsBuiltDrawingModule,
    PegawaiModule,
    ImportModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
