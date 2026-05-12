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
exports.TowersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const towers_service_1 = require("./towers.service");
const create_tower_dto_1 = require("./dto/create-tower.dto");
const update_tower_dto_1 = require("./dto/update-tower.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
let TowersController = class TowersController {
    towersService;
    constructor(towersService) {
        this.towersService = towersService;
    }
    findAll(query) {
        return this.towersService.findAll(query);
    }
    findAllForMap() {
        return this.towersService.findAllForMap();
    }
    findAllForDropdown() {
        return this.towersService.findAllForDropdown();
    }
    findOne(id) {
        return this.towersService.findOne(id);
    }
    create(dto) {
        return this.towersService.create(dto);
    }
    update(id, dto) {
        return this.towersService.update(id, dto);
    }
    remove(id) {
        return this.towersService.remove(id);
    }
};
exports.TowersController = TowersController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List semua tower dengan filter' }),
    (0, swagger_1.ApiQuery)({ name: 'tipe', required: false, enum: ['SUTET', 'SUTT', 'SKTT', 'garduInduk'] }),
    (0, swagger_1.ApiQuery)({ name: 'kondisi', required: false, enum: ['baik', 'sedang', 'buruk'] }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TowersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('map'),
    (0, swagger_1.ApiOperation)({ summary: 'Data tower untuk peta (koordinat + kondisi)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TowersController.prototype, "findAllForMap", null);
__decorate([
    (0, common_1.Get)('dropdown'),
    (0, swagger_1.ApiOperation)({ summary: 'Dropdown tower (id, nomorTower, garduInduk, tipe, koordinat, radius)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TowersController.prototype, "findAllForDropdown", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Detail satu tower' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Tower ID (e.g. T-23)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TowersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Tambah tower baru (admin)' }),
    (0, swagger_1.ApiBody)({ type: create_tower_dto_1.CreateTowerDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_tower_dto_1.CreateTowerDto]),
    __metadata("design:returntype", void 0)
], TowersController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Update data tower (admin)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Tower ID' }),
    (0, swagger_1.ApiBody)({ type: update_tower_dto_1.UpdateTowerDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_tower_dto_1.UpdateTowerDto]),
    __metadata("design:returntype", void 0)
], TowersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Hapus tower (admin)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Tower ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TowersController.prototype, "remove", null);
exports.TowersController = TowersController = __decorate([
    (0, swagger_1.ApiTags)('Towers'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('towers'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [towers_service_1.TowersService])
], TowersController);
//# sourceMappingURL=towers.controller.js.map