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
exports.AsBuiltDrawingController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const fs_1 = require("fs");
const swagger_1 = require("@nestjs/swagger");
const as_built_drawing_service_1 = require("./as-built-drawing.service");
const create_as_built_drawing_dto_1 = require("./dto/create-as-built-drawing.dto");
const update_as_built_drawing_dto_1 = require("./dto/update-as-built-drawing.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
let AsBuiltDrawingController = class AsBuiltDrawingController {
    asBuiltDrawingService;
    constructor(asBuiltDrawingService) {
        this.asBuiltDrawingService = asBuiltDrawingService;
    }
    findAll(query) {
        return this.asBuiltDrawingService.findAllFolders(query);
    }
    findFolder(id) {
        return this.asBuiltDrawingService.findFolder(id);
    }
    createFolder(dto) {
        return this.asBuiltDrawingService.createFolder(dto);
    }
    updateFolder(id, dto) {
        return this.asBuiltDrawingService.updateFolder(id, dto);
    }
    deleteFolder(id) {
        return this.asBuiltDrawingService.deleteFolder(id);
    }
    findDokumen(folderId) {
        return this.asBuiltDrawingService.findDokumenByFolder(folderId);
    }
    uploadDokumen(folderId, file) {
        const fileUrl = `/uploads/asbuilt/${file.filename}`;
        return this.asBuiltDrawingService.addDokumen(folderId, file.originalname, fileUrl);
    }
    findOneDokumen(id) {
        return this.asBuiltDrawingService.findDokumen(id);
    }
    async previewDokumen(id, res) {
        const doc = await this.asBuiltDrawingService.findDokumen(id);
        const filePath = (0, path_1.join)(process.cwd(), doc.fileUrl);
        if (!(0, fs_1.existsSync)(filePath)) {
            return res.status(404).json({ message: 'File tidak ditemukan di server' });
        }
        const ext = (0, path_1.extname)(doc.namaFile).toLowerCase();
        const mime = ext === '.pdf' ? 'application/pdf'
            : ['.png', '.jpg', '.jpeg'].includes(ext) ? `image/${ext.slice(1)}`
                : 'application/octet-stream';
        res.setHeader('Content-Type', mime);
        res.setHeader('Content-Disposition', `inline; filename="${doc.namaFile}"`);
        (0, fs_1.createReadStream)(filePath).pipe(res);
    }
    deleteDokumen(id) {
        return this.asBuiltDrawingService.deleteDokumen(id);
    }
};
exports.AsBuiltDrawingController = AsBuiltDrawingController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List semua folder as-built drawing' }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'tipe', required: false, enum: ['Electrical', 'Mechanical', 'Civil', 'Grounding', 'Lainnya'] }),
    (0, swagger_1.ApiQuery)({ name: 'tahun', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'towerId', required: false }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AsBuiltDrawingController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Detail folder + list dokumen' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Folder ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AsBuiltDrawingController.prototype, "findFolder", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Buat folder as-built drawing baru (admin)' }),
    (0, swagger_1.ApiBody)({ type: create_as_built_drawing_dto_1.CreateFolderDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_as_built_drawing_dto_1.CreateFolderDto]),
    __metadata("design:returntype", void 0)
], AsBuiltDrawingController.prototype, "createFolder", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Update folder (admin)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Folder ID' }),
    (0, swagger_1.ApiBody)({ type: update_as_built_drawing_dto_1.UpdateAsBuiltDrawingDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_as_built_drawing_dto_1.UpdateAsBuiltDrawingDto]),
    __metadata("design:returntype", void 0)
], AsBuiltDrawingController.prototype, "updateFolder", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Hapus folder + semua dokumen (admin)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Folder ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AsBuiltDrawingController.prototype, "deleteFolder", null);
__decorate([
    (0, common_1.Get)(':folderId/dokumen'),
    (0, swagger_1.ApiOperation)({ summary: 'List dokumen dalam folder' }),
    (0, swagger_1.ApiParam)({ name: 'folderId', description: 'Folder ID' }),
    __param(0, (0, common_1.Param)('folderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AsBuiltDrawingController.prototype, "findDokumen", null);
__decorate([
    (0, common_1.Post)(':folderId/dokumen'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload dokumen ke folder (admin)' }),
    (0, swagger_1.ApiParam)({ name: 'folderId', description: 'Folder ID' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: (0, path_1.join)(process.cwd(), 'uploads', 'asbuilt'),
            filename: (_req, file, cb) => cb(null, `${Date.now()}${(0, path_1.extname)(file.originalname)}`),
        }),
    })),
    __param(0, (0, common_1.Param)('folderId')),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AsBuiltDrawingController.prototype, "uploadDokumen", null);
__decorate([
    (0, common_1.Get)('dokumen/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Metadata satu dokumen' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Dokumen ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AsBuiltDrawingController.prototype, "findOneDokumen", null);
__decorate([
    (0, common_1.Get)('dokumen/:id/preview'),
    (0, swagger_1.ApiOperation)({ summary: 'Stream file dokumen inline untuk preview (PDF/gambar)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Dokumen ID' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)({ passthrough: false })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AsBuiltDrawingController.prototype, "previewDokumen", null);
__decorate([
    (0, common_1.Delete)('dokumen/:id'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Hapus dokumen (admin)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Dokumen ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AsBuiltDrawingController.prototype, "deleteDokumen", null);
exports.AsBuiltDrawingController = AsBuiltDrawingController = __decorate([
    (0, swagger_1.ApiTags)('As-Built Drawing'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('as-built-drawing'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [as_built_drawing_service_1.AsBuiltDrawingService])
], AsBuiltDrawingController);
//# sourceMappingURL=as-built-drawing.controller.js.map