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
        return this.asBuiltDrawingService.findAll(query);
    }
    findOne(id) {
        return this.asBuiltDrawingService.findOne(id);
    }
    create(dto) {
        return this.asBuiltDrawingService.create(dto);
    }
    update(id, dto) {
        return this.asBuiltDrawingService.update(id, dto);
    }
    remove(id) {
        return this.asBuiltDrawingService.remove(id);
    }
    uploadFile(id, file) {
        return this.asBuiltDrawingService.updateFileUrl(id, `/uploads/asbuilt/${file.filename}`);
    }
};
exports.AsBuiltDrawingController = AsBuiltDrawingController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AsBuiltDrawingController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AsBuiltDrawingController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_as_built_drawing_dto_1.CreateAsBuiltDrawingDto]),
    __metadata("design:returntype", void 0)
], AsBuiltDrawingController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_as_built_drawing_dto_1.UpdateAsBuiltDrawingDto]),
    __metadata("design:returntype", void 0)
], AsBuiltDrawingController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AsBuiltDrawingController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/upload'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: (0, path_1.join)(process.cwd(), 'uploads', 'asbuilt'),
            filename: (req, file, cb) => cb(null, `${Date.now()}${(0, path_1.extname)(file.originalname)}`),
        }),
    })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AsBuiltDrawingController.prototype, "uploadFile", null);
exports.AsBuiltDrawingController = AsBuiltDrawingController = __decorate([
    (0, common_1.Controller)('as-built-drawing'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [as_built_drawing_service_1.AsBuiltDrawingService])
], AsBuiltDrawingController);
//# sourceMappingURL=as-built-drawing.controller.js.map