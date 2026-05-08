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
exports.LaporanController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const laporan_service_1 = require("./laporan.service");
const create_laporan_dto_1 = require("./dto/create-laporan.dto");
const update_laporan_dto_1 = require("./dto/update-laporan.dto");
const query_laporan_dto_1 = require("./dto/query-laporan.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const uploadStorage = (0, multer_1.diskStorage)({
    destination: (0, path_1.join)(process.cwd(), 'uploads', 'laporan'),
    filename: (_req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `laporan-${unique}${(0, path_1.extname)(file.originalname)}`);
    },
});
let LaporanController = class LaporanController {
    laporanService;
    constructor(laporanService) {
        this.laporanService = laporanService;
    }
    findAll(query) {
        return this.laporanService.findAll(query);
    }
    getStats() {
        return this.laporanService.getStats();
    }
    findOne(id) {
        return this.laporanService.findOne(id);
    }
    create(dto, req) {
        return this.laporanService.create(dto, req.user.id);
    }
    async uploadFoto(files, req) {
        const baseUrl = process.env.BACKEND_URL ?? `http://localhost:${process.env.PORT ?? 3001}`;
        const urls = files.map((f) => `${baseUrl}/uploads/laporan/${f.filename}`);
        return { urls };
    }
    update(id, dto) {
        return this.laporanService.update(id, dto);
    }
    remove(id) {
        return this.laporanService.remove(id);
    }
};
exports.LaporanController = LaporanController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_laporan_dto_1.QueryLaporanDto]),
    __metadata("design:returntype", void 0)
], LaporanController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LaporanController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LaporanController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_laporan_dto_1.CreateLaporanDto, Object]),
    __metadata("design:returntype", void 0)
], LaporanController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('upload-foto'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('foto', 10, { storage: uploadStorage })),
    __param(0, (0, common_1.UploadedFiles)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", Promise)
], LaporanController.prototype, "uploadFoto", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_laporan_dto_1.UpdateLaporanDto]),
    __metadata("design:returntype", void 0)
], LaporanController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LaporanController.prototype, "remove", null);
exports.LaporanController = LaporanController = __decorate([
    (0, common_1.Controller)('laporan'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [laporan_service_1.LaporanService])
], LaporanController);
//# sourceMappingURL=laporan.controller.js.map