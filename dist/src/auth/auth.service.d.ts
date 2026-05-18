import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuthService {
    private prisma;
    private jwt;
    constructor(prisma: PrismaService, jwt: JwtService);
    login(identifier: string, password: string): Promise<{
        access_token: string;
        pegawai: {
            id: string;
            nik: string;
            nama: string;
            jabatan: string;
            unit: string;
            role: string;
            foto: string | null;
        };
    }>;
    changePassword(userId: string, passwordLama: string, passwordBaru: string): Promise<{
        message: string;
    }>;
    requestChangePassword(userId: string, passwordLama: string, passwordBaru: string, konfirmasiPasswordBaru: string): Promise<{
        message: string;
    }>;
    listPasswordChangeRequests(): Promise<{
        newPasswordHash: undefined;
        status: string;
        pegawai: {
            unit: string;
            id: string;
            nama: string;
            nik: string;
            jabatan: string;
        };
        reviewedBy: {
            id: string;
            nama: string;
        } | null;
        id: string;
        expiredAt: Date;
        pegawaiId: string;
        requestedAt: Date;
        reviewedAt: Date | null;
        reviewedById: string | null;
    }[]>;
    approvePasswordChangeRequest(requestId: string, adminId: string): Promise<{
        message: string;
    }>;
    rejectPasswordChangeRequest(requestId: string, adminId: string): Promise<{
        message: string;
    }>;
    deletePasswordChangeRequest(requestId: string): Promise<{
        message: string;
    }>;
}
