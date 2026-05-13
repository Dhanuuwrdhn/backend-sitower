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
exports.CreatePegawaiDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreatePegawaiDto {
    nik;
    nama;
    jabatan;
    unit;
    role;
    password;
    aktif;
    foto;
    expiredAt;
}
exports.CreatePegawaiDto = CreatePegawaiDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '199001010001' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePegawaiDto.prototype, "nik", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Budi Santoso' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePegawaiDto.prototype, "nama", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Teknisi Jaringan' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePegawaiDto.prototype, "jabatan", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'UIW Banten' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePegawaiDto.prototype, "unit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'teknisi', enum: ['admin', 'teknisi', 'viewer'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePegawaiDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'password123', minLength: 6 }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6),
    __metadata("design:type", String)
], CreatePegawaiDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreatePegawaiDto.prototype, "aktif", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'https://example.com/foto.jpg' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePegawaiDto.prototype, "foto", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-12-31T23:59:59.000Z', description: 'Tanggal akun kedaluwarsa (superadmin only)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreatePegawaiDto.prototype, "expiredAt", void 0);
//# sourceMappingURL=create-pegawai.dto.js.map