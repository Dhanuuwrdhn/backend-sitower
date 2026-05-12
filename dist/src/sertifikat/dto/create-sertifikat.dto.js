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
exports.CreateSertifikatDto = exports.CreateFolderDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateFolderDto {
    nama;
    kategori;
    status;
    towerId;
    berlakuHingga;
}
exports.CreateFolderDto = CreateFolderDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Sertifikat Kelayakan Tower T-23' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateFolderDto.prototype, "nama", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['Kelayakan', 'Grounding', 'Konstruksi', 'K3', 'Lingkungan'], example: 'Kelayakan' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['Kelayakan', 'Grounding', 'Konstruksi', 'K3', 'Lingkungan']),
    __metadata("design:type", String)
], CreateFolderDto.prototype, "kategori", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['berlaku', 'expired'], example: 'berlaku' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['berlaku', 'expired']),
    __metadata("design:type", String)
], CreateFolderDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'T-23', description: 'ID tower (opsional)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateFolderDto.prototype, "towerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2027-12-31', description: 'Tanggal berlaku hingga (ISO date)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateFolderDto.prototype, "berlakuHingga", void 0);
class CreateSertifikatDto extends CreateFolderDto {
}
exports.CreateSertifikatDto = CreateSertifikatDto;
//# sourceMappingURL=create-sertifikat.dto.js.map