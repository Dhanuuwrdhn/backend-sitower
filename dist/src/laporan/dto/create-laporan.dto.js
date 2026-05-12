"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateLaporanDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateLaporanDto {
    towerId;
    jenisGangguan;
    deskripsi;
    levelRisiko;
    status;
    tanggal;
    lokasiDetail;
    keterangan;
    foto;
    noSpk;
    teknisi;
    temuan;
    hasil;
    penyebab;
    durasi;
    jenisCleanup;
}
exports.CreateLaporanDto = CreateLaporanDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'T-23' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLaporanDto.prototype, "towerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'pekerjaan_pihak_lain', enum: ['pekerjaan_pihak_lain', 'kebakaran', 'layangan', 'pencurian', 'pemanfaatan_lahan', 'gangguan', 'span', 'cui', 'cleanup'] }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLaporanDto.prototype, "jenisGangguan", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Ditemukan aktivitas pihak lain di sekitar tower' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLaporanDto.prototype, "deskripsi", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'sedang', enum: ['kritis', 'sedang', 'aman'] }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLaporanDto.prototype, "levelRisiko", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'berlangsung', enum: ['berlangsung', 'selesai', 'tidak_ada_aktifitas'] }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateLaporanDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2025-05-10T08:30:00.000Z' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateLaporanDto.prototype, "tanggal", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Kec. Cikupa, dekat jalan raya' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateLaporanDto.prototype, "lokasiDetail", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Catatan tambahan laporan' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateLaporanDto.prototype, "keterangan", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String], example: ['https://example.com/foto1.jpg'] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateLaporanDto.prototype, "foto", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'SPK-2025-001' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateLaporanDto.prototype, "noSpk", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Budi Santoso' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateLaporanDto.prototype, "teknisi", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Korosi pada badan tower' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateLaporanDto.prototype, "temuan", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Pengecatan ulang selesai' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateLaporanDto.prototype, "hasil", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Sambaran petir langsung' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateLaporanDto.prototype, "penyebab", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '3.5' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateLaporanDto.prototype, "durasi", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Pembersihan semak' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateLaporanDto.prototype, "jenisCleanup", void 0);
//# sourceMappingURL=create-laporan.dto.js.map