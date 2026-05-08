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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
let AuthService = class AuthService {
    prisma;
    jwt;
    constructor(prisma, jwt) {
        this.prisma = prisma;
        this.jwt = jwt;
    }
    async login(nik, password) {
        const pegawai = await this.prisma.pegawai.findUnique({ where: { nik } });
        if (!pegawai || !pegawai.aktif)
            throw new common_1.UnauthorizedException('NIK tidak ditemukan atau akun nonaktif');
        const valid = await bcrypt.compare(password, pegawai.password);
        if (!valid)
            throw new common_1.UnauthorizedException('Password salah');
        const payload = {
            sub: pegawai.id,
            nik: pegawai.nik,
            nama: pegawai.nama,
            role: pegawai.role,
            jabatan: pegawai.jabatan,
            unit: pegawai.unit,
        };
        return {
            access_token: this.jwt.sign(payload),
            pegawai: {
                id: pegawai.id,
                nik: pegawai.nik,
                nama: pegawai.nama,
                jabatan: pegawai.jabatan,
                unit: pegawai.unit,
                role: pegawai.role,
                foto: pegawai.foto,
            },
        };
    }
    async changePassword(userId, passwordLama, passwordBaru) {
        const pegawai = await this.prisma.pegawai.findUnique({ where: { id: userId } });
        if (!pegawai)
            throw new common_1.UnauthorizedException();
        const valid = await bcrypt.compare(passwordLama, pegawai.password);
        if (!valid)
            throw new common_1.BadRequestException('Password lama salah');
        const hashed = await bcrypt.hash(passwordBaru, 10);
        await this.prisma.pegawai.update({
            where: { id: userId },
            data: { password: hashed },
        });
        return { message: 'Password berhasil diubah' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map