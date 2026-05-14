import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RequestChangePasswordDto } from './dto/request-change-password.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(dto: LoginDto): Promise<{
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
    profile(req: any): any;
    changePassword(dto: ChangePasswordDto, req: any): Promise<{
        message: string;
    }>;
    requestChangePassword(dto: RequestChangePasswordDto, req: any): Promise<{
        message: string;
    }>;
    listRequests(): Promise<{
        newPasswordHash: undefined;
        status: string;
        pegawai: {
            id: string;
            nik: string;
            nama: string;
            jabatan: string;
            unit: string;
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
    approveRequest(id: string, req: any): Promise<{
        message: string;
    }>;
    rejectRequest(id: string, req: any): Promise<{
        message: string;
    }>;
}
