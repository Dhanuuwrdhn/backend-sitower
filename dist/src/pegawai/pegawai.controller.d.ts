import { PegawaiService } from './pegawai.service';
import { CreatePegawaiDto } from './dto/create-pegawai.dto';
import { UpdatePegawaiDto } from './dto/update-pegawai.dto';
export declare class PegawaiController {
    private pegawaiService;
    constructor(pegawaiService: PegawaiService);
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        nik: string;
        nama: string;
        jabatan: string;
        unit: string;
        role: string;
        aktif: boolean;
        foto: string | null;
        createdAt: Date;
        expiredAt: Date | null;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        nik: string;
        nama: string;
        jabatan: string;
        unit: string;
        role: string;
        aktif: boolean;
        foto: string | null;
        createdAt: Date;
        updatedAt: Date;
        expiredAt: Date | null;
    }>;
    create(dto: CreatePegawaiDto): Promise<{
        id: string;
        nik: string;
        nama: string;
        jabatan: string;
        unit: string;
        role: string;
        aktif: boolean;
        expiredAt: Date | null;
    }>;
    update(id: string, dto: UpdatePegawaiDto): Promise<{
        id: string;
        nik: string;
        nama: string;
        jabatan: string;
        unit: string;
        role: string;
        aktif: boolean;
        expiredAt: Date | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        nik: string;
        nama: string;
        jabatan: string;
        unit: string;
        role: string;
        password: string;
        aktif: boolean;
        foto: string | null;
        createdAt: Date;
        updatedAt: Date;
        expiredAt: Date | null;
    }>;
    toggleAktif(id: string): Promise<{
        id: string;
        nik: string;
        nama: string;
        aktif: boolean;
    }>;
}
