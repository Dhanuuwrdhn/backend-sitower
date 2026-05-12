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
exports.CreateTowerDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateTowerDto {
    id;
    nama;
    lat;
    lng;
    tegangan;
    tipe;
    kondisi;
    lokasi;
    radius;
    jalur;
    nomorUrut;
    routeId;
    statusKerawanan;
    jenisKerawanan;
    pplNotes;
    penanggungJawab;
    telepon;
    sertifikatLink;
}
exports.CreateTowerDto = CreateTowerDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'T-23' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTowerDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Tower Cikupa–Balaraja' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTowerDto.prototype, "nama", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: -6.2123 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateTowerDto.prototype, "lat", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 106.7654 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateTowerDto.prototype, "lng", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '150kV', description: 'Tegangan tower' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTowerDto.prototype, "tegangan", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'SUTET', enum: ['SUTET', 'SUTT', 'SKTT', 'garduInduk'] }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTowerDto.prototype, "tipe", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'baik', enum: ['baik', 'sedang', 'buruk'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTowerDto.prototype, "kondisi", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Kec. Cikupa, Tangerang' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTowerDto.prototype, "lokasi", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 100, description: 'Radius deteksi dalam meter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateTowerDto.prototype, "radius", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'SUTET 500kV DURIKOSAMBI-KEMBANGAN', description: 'Nama jalur transmisi' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTowerDto.prototype, "jalur", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 42, description: 'Nomor urut tower dalam jalur' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateTowerDto.prototype, "nomorUrut", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 1, description: 'ID TransmissionRoute' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateTowerDto.prototype, "routeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'aman', enum: ['aman', 'sedang', 'kritis'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTowerDto.prototype, "statusKerawanan", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'ppl', enum: ['ppl', 'layangan', 'kebakaran', 'pencurian', 'pemanfaatan_lahan'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTowerDto.prototype, "jenisKerawanan", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTowerDto.prototype, "pplNotes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTowerDto.prototype, "penanggungJawab", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTowerDto.prototype, "telepon", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTowerDto.prototype, "sertifikatLink", void 0);
//# sourceMappingURL=create-tower.dto.js.map