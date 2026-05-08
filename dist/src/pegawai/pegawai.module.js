"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PegawaiModule = void 0;
const common_1 = require("@nestjs/common");
const pegawai_service_1 = require("./pegawai.service");
const pegawai_controller_1 = require("./pegawai.controller");
let PegawaiModule = class PegawaiModule {
};
exports.PegawaiModule = PegawaiModule;
exports.PegawaiModule = PegawaiModule = __decorate([
    (0, common_1.Module)({
        controllers: [pegawai_controller_1.PegawaiController],
        providers: [pegawai_service_1.PegawaiService],
        exports: [pegawai_service_1.PegawaiService],
    })
], PegawaiModule);
//# sourceMappingURL=pegawai.module.js.map