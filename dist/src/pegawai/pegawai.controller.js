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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PegawaiController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const pegawai_service_1 = require("./pegawai.service");
const create_pegawai_dto_1 = require("./dto/create-pegawai.dto");
const update_pegawai_dto_1 = require("./dto/update-pegawai.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
let PegawaiController = class PegawaiController {
    pegawaiService;
    constructor(pegawaiService) {
        this.pegawaiService = pegawaiService;
    }
    findAll() {
        return this.pegawaiService.findAll();
    }
    findOne(id) {
        return this.pegawaiService.findOne(id);
    }
    create(dto) {
        return this.pegawaiService.create(dto);
    }
    update(id, dto) {
        return this.pegawaiService.update(id, dto);
    }
    remove(id) {
        return this.pegawaiService.remove(id);
    }
    toggleAktif(id) {
        return this.pegawaiService.toggleAktif(id);
    }
};
exports.PegawaiController = PegawaiController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List semua pegawai (admin)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PegawaiController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Detail satu pegawai (admin)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Pegawai ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PegawaiController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Tambah pegawai baru (admin)' }),
    (0, swagger_1.ApiBody)({ type: create_pegawai_dto_1.CreatePegawaiDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_pegawai_dto_1.CreatePegawaiDto]),
    __metadata("design:returntype", void 0)
], PegawaiController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update data pegawai (admin)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Pegawai ID' }),
    (0, swagger_1.ApiBody)({ type: update_pegawai_dto_1.UpdatePegawaiDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_pegawai_dto_1.UpdatePegawaiDto]),
    __metadata("design:returntype", void 0)
], PegawaiController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Hapus pegawai (admin)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Pegawai ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PegawaiController.prototype, "remove", null);
__decorate([
    (0, common_1.Put)(':id/toggle-aktif'),
    (0, swagger_1.ApiOperation)({ summary: 'Toggle status aktif pegawai (admin)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Pegawai ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PegawaiController.prototype, "toggleAktif", null);
exports.PegawaiController = PegawaiController = __decorate([
    (0, swagger_1.ApiTags)('Pegawai'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('pegawai'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __metadata("design:paramtypes", [pegawai_service_1.PegawaiService])
], PegawaiController);
//# sourceMappingURL=pegawai.controller.js.map