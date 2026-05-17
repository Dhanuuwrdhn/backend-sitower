import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './auth/auth.module'
import { TowersModule } from './towers/towers.module'
import { LaporanModule } from './laporan/laporan.module'
import { AsBuiltDrawingModule } from './as-built-drawing/as-built-drawing.module'
import { PegawaiModule } from './pegawai/pegawai.module'
import { ImportModule } from './import/import.module'
import { JalurKmlModule } from './jalur-kml/jalur-kml.module'
import { AsetModule } from './aset/aset.module'
import { UnitsModule } from './units/units.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    TowersModule,
    LaporanModule,
    AsBuiltDrawingModule,
    PegawaiModule,
    ImportModule,
    JalurKmlModule,
    AsetModule,
    UnitsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
