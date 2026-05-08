import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
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
}
