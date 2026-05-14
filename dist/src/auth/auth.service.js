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
const PASSWORD_CHANGE_EXPIRY_HOURS = 24;
let AuthService = class AuthService {
    prisma;
    jwt;
    constructor(prisma, jwt) {
        this.prisma = prisma;
        this.jwt = jwt;
    }
    async login(identifier, password) {
        const pegawai = await this.prisma.pegawai.findFirst({
            where: { OR: [{ nik: identifier }, { username: identifier }] },
        });
        if (!pegawai || !pegawai.aktif)
            throw new common_1.UnauthorizedException('NIK / username tidak ditemukan atau akun nonaktif');
        if (pegawai.expiredAt && pegawai.expiredAt < new Date())
            throw new common_1.ForbiddenException('Anda tidak bisa login');
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
    async requestChangePassword(userId, passwordLama, passwordBaru, konfirmasiPasswordBaru) {
        if (passwordBaru !== konfirmasiPasswordBaru)
            throw new common_1.BadRequestException('Password baru dan konfirmasi tidak cocok');
        const pegawai = await this.prisma.pegawai.findUnique({ where: { id: userId } });
        if (!pegawai)
            throw new common_1.UnauthorizedException();
        const valid = await bcrypt.compare(passwordLama, pegawai.password);
        if (!valid)
            throw new common_1.BadRequestException('Password lama salah');
        const existing = await this.prisma.passwordChangeRequest.findFirst({
            where: {
                pegawaiId: userId,
                status: 'pending',
                expiredAt: { gt: new Date() },
            },
        });
        if (existing)
            throw new common_1.ConflictException('Sudah ada permintaan ganti password yang sedang menunggu persetujuan admin');
        const newPasswordHash = await bcrypt.hash(passwordBaru, 10);
        const expiredAt = new Date();
        expiredAt.setHours(expiredAt.getHours() + PASSWORD_CHANGE_EXPIRY_HOURS);
        await this.prisma.passwordChangeRequest.create({
            data: {
                pegawaiId: userId,
                newPasswordHash,
                expiredAt,
            },
        });
        return { message: 'Permintaan ganti password telah dikirim ke admin untuk disetujui' };
    }
    async listPasswordChangeRequests() {
        const requests = await this.prisma.passwordChangeRequest.findMany({
            orderBy: { requestedAt: 'desc' },
            include: {
                pegawai: { select: { id: true, nik: true, nama: true, jabatan: true, unit: true } },
                reviewedBy: { select: { id: true, nama: true } },
            },
        });
        const now = new Date();
        return requests.map(r => ({
            ...r,
            newPasswordHash: undefined,
            status: r.status === 'pending' && r.expiredAt < now ? 'expired' : r.status,
        }));
    }
    async approvePasswordChangeRequest(requestId, adminId) {
        const request = await this.prisma.passwordChangeRequest.findUnique({
            where: { id: requestId },
        });
        if (!request)
            throw new common_1.NotFoundException('Request tidak ditemukan');
        if (request.status !== 'pending')
            throw new common_1.BadRequestException('Request sudah diproses');
        if (request.expiredAt < new Date())
            throw new common_1.BadRequestException('Request sudah kedaluwarsa');
        await this.prisma.$transaction([
            this.prisma.pegawai.update({
                where: { id: request.pegawaiId },
                data: { password: request.newPasswordHash },
            }),
            this.prisma.passwordChangeRequest.update({
                where: { id: requestId },
                data: { status: 'approved', reviewedAt: new Date(), reviewedById: adminId },
            }),
        ]);
        return { message: 'Permintaan ganti password telah disetujui dan password berhasil diperbarui' };
    }
    async rejectPasswordChangeRequest(requestId, adminId) {
        const request = await this.prisma.passwordChangeRequest.findUnique({
            where: { id: requestId },
        });
        if (!request)
            throw new common_1.NotFoundException('Request tidak ditemukan');
        if (request.status !== 'pending')
            throw new common_1.BadRequestException('Request sudah diproses');
        await this.prisma.passwordChangeRequest.update({
            where: { id: requestId },
            data: { status: 'rejected', reviewedAt: new Date(), reviewedById: adminId },
        });
        return { message: 'Permintaan ganti password telah ditolak' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map