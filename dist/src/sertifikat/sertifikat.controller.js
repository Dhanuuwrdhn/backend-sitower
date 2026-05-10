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
exports.SertifikatController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const fs_1 = require("fs");
const swagger_1 = require("@nestjs/swagger");
const sertifikat_service_1 = require("./sertifikat.service");
const create_sertifikat_dto_1 = require("./dto/create-sertifikat.dto");
const update_sertifikat_dto_1 = require("./dto/update-sertifikat.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
let SertifikatController = class SertifikatController {
    sertifikatService;
    constructor(sertifikatService) {
        this.sertifikatService = sertifikatService;
    }
    findAll(query) {
        return this.sertifikatService.findAllFolders(query);
    }
    findFolder(id) {
        return this.sertifikatService.findFolder(id);
    }
    createFolder(dto) {
        return this.sertifikatService.createFolder(dto);
    }
    updateFolder(id, dto) {
        return this.sertifikatService.updateFolder(id, dto);
    }
    deleteFolder(id) {
        return this.sertifikatService.deleteFolder(id);
    }
    findDokumen(folderId) {
        return this.sertifikatService.findDokumenByFolder(folderId);
    }
    uploadDokumen(folderId, file) {
        const fileUrl = `/uploads/sertifikat/${file.filename}`;
        return this.sertifikatService.addDokumen(folderId, file.originalname, fileUrl);
    }
    findOneDokumen(id) {
        return this.sertifikatService.findDokumen(id);
    }
    async previewDokumen(id, res) {
        const doc = await this.sertifikatService.findDokumen(id);
        const filePath = (0, path_1.join)(process.cwd(), doc.fileUrl);
        if (!(0, fs_1.existsSync)(filePath)) {
            return res.status(404).json({ message: 'File tidak ditemukan di server' });
        }
        const ext = (0, path_1.extname)(doc.namaFile).toLowerCase();
        const mime = ext === '.pdf' ? 'application/pdf' : 'application/octet-stream';
        res.setHeader('Content-Type', mime);
        res.setHeader('Content-Disposition', `inline; filename="${doc.namaFile}"`);
        (0, fs_1.createReadStream)(filePath).pipe(res);
    }
    deleteDokumen(id) {
        return this.sertifikatService.deleteDokumen(id);
    }
};
exports.SertifikatController = SertifikatController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List semua folder sertifikat' }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, description: 'Cari berdasarkan nama tower' }),
    (0, swagger_1.ApiQuery)({ name: 'kategori', required: false, enum: ['Kelayakan', 'Grounding', 'Konstruksi', 'K3', 'Lingkungan'] }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: ['berlaku', 'expired'] }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SertifikatController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Detail folder + list dokumen di dalamnya' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Folder ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SertifikatController.prototype, "findFolder", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Buat folder sertifikat baru (admin)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_sertifikat_dto_1.CreateFolderDto]),
    __metadata("design:returntype", void 0)
], SertifikatController.prototype, "createFolder", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Update folder sertifikat (admin)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Folder ID' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_sertifikat_dto_1.UpdateSertifikatDto]),
    __metadata("design:returntype", void 0)
], SertifikatController.prototype, "updateFolder", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Hapus folder + semua dokumen di dalamnya (admin)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Folder ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SertifikatController.prototype, "deleteFolder", null);
__decorate([
    (0, common_1.Get)(':folderId/dokumen'),
    (0, swagger_1.ApiOperation)({ summary: 'List dokumen dalam folder' }),
    (0, swagger_1.ApiParam)({ name: 'folderId', description: 'Folder ID' }),
    __param(0, (0, common_1.Param)('folderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SertifikatController.prototype, "findDokumen", null);
__decorate([
    (0, common_1.Post)(':folderId/dokumen'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload dokumen ke folder (admin) — multipart/form-data, field: file' }),
    (0, swagger_1.ApiParam)({ name: 'folderId', description: 'Folder ID' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: (0, path_1.join)(process.cwd(), 'uploads', 'sertifikat'),
            filename: (_req, file, cb) => cb(null, `${Date.now()}${(0, path_1.extname)(file.originalname)}`),
        }),
    })),
    __param(0, (0, common_1.Param)('folderId')),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SertifikatController.prototype, "uploadDokumen", null);
__decorate([
    (0, common_1.Get)('dokumen/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Metadata satu dokumen' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Dokumen ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SertifikatController.prototype, "findOneDokumen", null);
__decorate([
    (0, common_1.Get)('dokumen/:id/preview'),
    (0, swagger_1.ApiOperation)({ summary: 'Stream file dokumen inline (PDF / gambar) untuk preview' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Dokumen ID' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)({ passthrough: false })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SertifikatController.prototype, "previewDokumen", null);
__decorate([
    (0, common_1.Delete)('dokumen/:id'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Hapus dokumen (admin)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Dokumen ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SertifikatController.prototype, "deleteDokumen", null);
exports.SertifikatController = SertifikatController = __decorate([
    (0, swagger_1.ApiTags)('Sertifikat'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('sertifikat'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [sertifikat_service_1.SertifikatService])
], SertifikatController);
//# sourceMappingURL=sertifikat.controller.js.map