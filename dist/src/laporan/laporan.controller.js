"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const fs = __importStar(require("fs"));
const swagger_1 = require("@nestjs/swagger");
const laporan_service_1 = require("./laporan.service");
const progress_service_1 = require("./progress.service");
const create_laporan_dto_1 = require("./dto/create-laporan.dto");
const update_laporan_dto_1 = require("./dto/update-laporan.dto");
const query_laporan_dto_1 = require("./dto/query-laporan.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const uploadStorage = (0, multer_1.diskStorage)({
    destination: (0, path_1.join)(process.cwd(), 'uploads', 'laporan'),
    filename: (_req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `laporan-${unique}${(0, path_1.extname)(file.originalname)}`);
    },
});
const progressStorage = (0, multer_1.diskStorage)({
    destination: (req, _file, cb) => {
        const dir = (0, path_1.join)(process.cwd(), 'uploads', 'progress');
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (_req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `progress-${unique}${(0, path_1.extname)(file.originalname)}`);
    },
});
let LaporanController = class LaporanController {
    laporanService;
    progressService;
    constructor(laporanService, progressService) {
        this.laporanService = laporanService;
        this.progressService = progressService;
    }
    findAll(query, req) {
        return this.laporanService.findAll(query, req.user);
    }
    getStats(req) {
        return this.laporanService.getStats(req.user);
    }
    findOne(id, req) {
        return this.laporanService.findOne(id, req.user);
    }
    create(dto, req) {
        return this.laporanService.create(dto, req.user.id);
    }
    async uploadFoto(files, req) {
        const baseUrl = process.env.BACKEND_URL ?? `http://localhost:${process.env.PORT ?? 3001}`;
        const urls = files.map((f) => `${baseUrl}/uploads/laporan/${f.filename}`);
        return { urls };
    }
    update(id, dto, req) {
        return this.laporanService.update(id, dto, req.user);
    }
    remove(id, req) {
        return this.laporanService.remove(id, req.user);
    }
    getProgress(id, req) {
        return this.progressService.getProgress(id, req.user);
    }
    async uploadProgress(id, file, tipe, req) {
        if (!file)
            throw new common_1.BadRequestException('File wajib diupload');
        const VALID_TIPE = ['spanduk', 'brosur', 'laporan_baru', 'berita_acara'];
        if (!VALID_TIPE.includes(tipe))
            throw new common_1.BadRequestException('Tipe progress tidak valid');
        const baseUrl = process.env.BACKEND_URL ?? `http://localhost:${process.env.PORT ?? 3001}`;
        const fileUrl = `${baseUrl}/uploads/progress/${file.filename}`;
        return this.progressService.addProgress(id, tipe, fileUrl, file.originalname, req.user);
    }
    deleteProgress(id, progressId, req) {
        return this.progressService.deleteProgress(id, progressId, req.user);
    }
    getFotoHistory(id, req) {
        return this.progressService.getFotoHistory(id, req.user);
    }
    getRiwayat(id, req) {
        return this.progressService.getRiwayat(id, req.user);
    }
    async addRiwayat(id, files, body, req) {
        if (!body.statusKerawanan || !body.progresLaporan) {
            throw new common_1.BadRequestException('statusKerawanan dan progresLaporan wajib diisi');
        }
        const baseUrl = process.env.BACKEND_URL ?? `http://localhost:${process.env.PORT ?? 3001}`;
        const toUrls = (arr) => (arr ?? []).map((f) => `${baseUrl}/uploads/progress/${f.filename}`);
        return this.progressService.addRiwayat(id, req.user?.nama ?? 'Sistem', {
            statusKerawanan: body.statusKerawanan,
            progresLaporan: body.progresLaporan,
            uraianPekerjaan: body.uraianPekerjaan,
            upayaPengendalian: body.upayaPengendalian,
            pihakLain: body.pihakLain,
            contactPerson: body.contactPerson,
            foto: toUrls(files.foto),
            beritaAcara: toUrls(files.beritaAcara),
            spanduk: toUrls(files.spanduk),
            surat: toUrls(files.surat),
        }, req.user);
    }
    deleteRiwayat(id, riwayatId, req) {
        return this.progressService.deleteRiwayat(id, riwayatId, req.user);
    }
    async uploadFotoUpdate(id, files, req) {
        if (!files?.length)
            throw new common_1.BadRequestException('Minimal 1 foto');
        const baseUrl = process.env.BACKEND_URL ?? `http://localhost:${process.env.PORT ?? 3001}`;
        const urls = files.map((f) => `${baseUrl}/uploads/laporan/${f.filename}`);
        await this.laporanService.updateFotoUrls(id, urls, req.user);
        return this.progressService.addFotoHistory(id, urls, req.user);
    }
};
exports.LaporanController = LaporanController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List laporan dengan filter & pagination' }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'jenisGangguan', required: false, enum: ['pekerjaan_pihak_lain', 'kebakaran', 'layangan', 'pencurian', 'pemanfaatan_lahan', 'gangguan', 'span', 'cui', 'cleanup'] }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: ['berlangsung', 'selesai', 'tidak_ada_aktifitas'] }),
    (0, swagger_1.ApiQuery)({ name: 'levelRisiko', required: false, enum: ['kritis', 'sedang', 'aman'] }),
    (0, swagger_1.ApiQuery)({ name: 'towerId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'tglMulai', required: false, description: 'YYYY-MM-DD' }),
    (0, swagger_1.ApiQuery)({ name: 'tglAkhir', required: false, description: 'YYYY-MM-DD' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_laporan_dto_1.QueryLaporanDto, Object]),
    __metadata("design:returntype", void 0)
], LaporanController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Statistik laporan per jenis + total + berlangsung' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LaporanController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Detail satu laporan' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Laporan ID' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], LaporanController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Buat laporan baru' }),
    (0, swagger_1.ApiBody)({ type: create_laporan_dto_1.CreateLaporanDto }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_laporan_dto_1.CreateLaporanDto, Object]),
    __metadata("design:returntype", void 0)
], LaporanController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('upload-foto'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload foto bukti laporan (multipart, field: foto, maks 10 file)' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({ schema: { type: 'object', properties: { foto: { type: 'array', items: { type: 'string', format: 'binary' } } } } }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('foto', 10, { storage: uploadStorage })),
    __param(0, (0, common_1.UploadedFiles)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", Promise)
], LaporanController.prototype, "uploadFoto", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update laporan' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Laporan ID' }),
    (0, swagger_1.ApiBody)({ type: update_laporan_dto_1.UpdateLaporanDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_laporan_dto_1.UpdateLaporanDto, Object]),
    __metadata("design:returntype", void 0)
], LaporanController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Hapus laporan (admin)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Laporan ID' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], LaporanController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)(':id/progress'),
    (0, swagger_1.ApiOperation)({ summary: 'List progress dokumen per laporan (grouped by tipe)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], LaporanController.prototype, "getProgress", null);
__decorate([
    (0, common_1.Post)(':id/progress'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload dokumen progress (spanduk/brosur/laporan_baru/berita_acara)' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({ schema: { type: 'object', properties: {
                tipe: { type: 'string', enum: ['spanduk', 'brosur', 'laporan_baru', 'berita_acara'] },
                file: { type: 'string', format: 'binary' },
            } } }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: progressStorage,
        limits: { fileSize: MAX_FILE_BYTES },
        fileFilter: (_req, file, cb) => {
            const allowed = /\.(jpg|jpeg|png|webp|pdf|doc|docx)$/i;
            if (!allowed.test(file.originalname)) {
                return cb(new common_1.BadRequestException('Format file tidak didukung'), false);
            }
            cb(null, true);
        },
    })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)('tipe')),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, Object]),
    __metadata("design:returntype", Promise)
], LaporanController.prototype, "uploadProgress", null);
__decorate([
    (0, common_1.Delete)(':id/progress/:progressId'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Hapus satu dokumen progress' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('progressId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], LaporanController.prototype, "deleteProgress", null);
__decorate([
    (0, common_1.Get)(':id/foto-history'),
    (0, swagger_1.ApiOperation)({ summary: 'List foto history per laporan (by date)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], LaporanController.prototype, "getFotoHistory", null);
__decorate([
    (0, common_1.Get)(':id/riwayat'),
    (0, swagger_1.ApiOperation)({ summary: 'List riwayat pembaruan laporan (terbaru di atas)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], LaporanController.prototype, "getRiwayat", null);
__decorate([
    (0, common_1.Post)(':id/riwayat'),
    (0, swagger_1.ApiOperation)({ summary: 'Tambah riwayat pembaruan laporan + sync status laporan' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'foto', maxCount: 10 },
        { name: 'beritaAcara', maxCount: 10 },
        { name: 'spanduk', maxCount: 10 },
        { name: 'surat', maxCount: 10 },
    ], {
        storage: progressStorage,
        limits: { fileSize: MAX_FILE_BYTES },
        fileFilter: (_req, file, cb) => {
            if (!/\.(jpg|jpeg|png|webp|pdf|doc|docx)$/i.test(file.originalname)) {
                return cb(new common_1.BadRequestException('Format file tidak didukung'), false);
            }
            cb(null, true);
        },
    })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], LaporanController.prototype, "addRiwayat", null);
__decorate([
    (0, common_1.Delete)(':id/riwayat/:riwayatId'),
    (0, swagger_1.ApiOperation)({ summary: 'Hapus satu entri riwayat pembaruan' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('riwayatId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], LaporanController.prototype, "deleteRiwayat", null);
__decorate([
    (0, common_1.Post)(':id/foto-update'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload foto update (disimpan dengan timestamp)' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({ schema: { type: 'object', properties: { foto: { type: 'array', items: { type: 'string', format: 'binary' } } } } }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('foto', 10, {
        storage: uploadStorage,
        limits: { fileSize: MAX_FILE_BYTES },
        fileFilter: (_req, file, cb) => {
            if (!/\.(jpg|jpeg|png|webp)$/i.test(file.originalname)) {
                return cb(new common_1.BadRequestException('Hanya JPG/PNG/WEBP'), false);
            }
            cb(null, true);
        },
    })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array, Object]),
    __metadata("design:returntype", Promise)
], LaporanController.prototype, "uploadFotoUpdate", null);
exports.LaporanController = LaporanController = __decorate([
    (0, swagger_1.ApiTags)('Laporan'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('laporan'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [laporan_service_1.LaporanService,
        progress_service_1.ProgressService])
], LaporanController);
//# sourceMappingURL=laporan.controller.js.map