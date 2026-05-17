"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const towers_module_1 = require("./towers/towers.module");
const laporan_module_1 = require("./laporan/laporan.module");
const as_built_drawing_module_1 = require("./as-built-drawing/as-built-drawing.module");
const pegawai_module_1 = require("./pegawai/pegawai.module");
const import_module_1 = require("./import/import.module");
const jalur_kml_module_1 = require("./jalur-kml/jalur-kml.module");
const aset_module_1 = require("./aset/aset.module");
const units_module_1 = require("./units/units.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            towers_module_1.TowersModule,
            laporan_module_1.LaporanModule,
            as_built_drawing_module_1.AsBuiltDrawingModule,
            pegawai_module_1.PegawaiModule,
            import_module_1.ImportModule,
            jalur_kml_module_1.JalurKmlModule,
            aset_module_1.AsetModule,
            units_module_1.UnitsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map