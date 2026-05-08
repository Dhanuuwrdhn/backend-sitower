import { PegawaiService } from './pegawai.service';
import { CreatePegawaiDto } from './dto/create-pegawai.dto';
import { UpdatePegawaiDto } from './dto/update-pegawai.dto';
export declare class PegawaiController {
    private pegawaiService;
    constructor(pegawaiService: PegawaiService);
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        nama: string;
        createdAt: Date;
        nik: string;
        jabatan: string;
        unit: string;
        role: string;
        aktif: boolean;
        foto: string | null;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        nama: string;
        createdAt: Date;
        updatedAt: Date;
        nik: string;
        jabatan: string;
        unit: string;
        role: string;
        aktif: boolean;
        foto: string | null;
    }>;
    create(dto: CreatePegawaiDto): Promise<{
        id: string;
        nama: string;
        nik: string;
        jabatan: string;
        unit: string;
        role: string;
        aktif: boolean;
    }>;
    update(id: string, dto: UpdatePegawaiDto): Promise<{
        id: string;
        nama: string;
        nik: string;
        jabatan: string;
        unit: string;
        role: string;
        aktif: boolean;
    }>;
    remove(id: string): Promise<{
        id: string;
        nama: string;
        createdAt: Date;
        updatedAt: Date;
        nik: string;
        jabatan: string;
        unit: string;
        role: string;
        password: string;
        aktif: boolean;
        foto: string | null;
    }>;
    toggleAktif(id: string): Promise<{
        id: string;
        nama: string;
        nik: string;
        aktif: boolean;
    }>;
}
