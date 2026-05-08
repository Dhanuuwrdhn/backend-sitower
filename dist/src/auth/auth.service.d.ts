import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuthService {
    private prisma;
    private jwt;
    constructor(prisma: PrismaService, jwt: JwtService);
    login(nik: string, password: string): Promise<{
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
}
