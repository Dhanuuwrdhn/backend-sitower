import { PrismaService } from '../prisma/prisma.service';
import { CreatePegawaiDto } from './dto/create-pegawai.dto';
import { UpdatePegawaiDto } from './dto/update-pegawai.dto';
export declare class PegawaiService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
        unit: string;
        id: string;
        nama: string;
        createdAt: Date;
        foto: string | null;
        nik: string;
        jabatan: string;
        role: string;
        aktif: boolean;
        expiredAt: Date | null;
    }[]>;
    findOne(id: string): Promise<{
        unit: string;
        id: string;
        nama: string;
        createdAt: Date;
        updatedAt: Date;
        foto: string | null;
        nik: string;
        jabatan: string;
        role: string;
        aktif: boolean;
        expiredAt: Date | null;
    }>;
    create(dto: CreatePegawaiDto): Promise<{
        unit: string;
        id: string;
        nama: string;
        nik: string;
        jabatan: string;
        role: string;
        aktif: boolean;
        expiredAt: Date | null;
    }>;
    update(id: string, dto: UpdatePegawaiDto): Promise<{
        unit: string;
        id: string;
        nama: string;
        nik: string;
        jabatan: string;
        role: string;
        aktif: boolean;
        expiredAt: Date | null;
    }>;
    remove(id: string): Promise<{
        unit: string;
        id: string;
        nama: string;
        createdAt: Date;
        updatedAt: Date;
        foto: string | null;
        nik: string;
        username: string | null;
        jabatan: string;
        role: string;
        password: string;
        aktif: boolean;
        expiredAt: Date | null;
    }>;
    toggleAktif(id: string): Promise<{
        id: string;
        nama: string;
        nik: string;
        aktif: boolean;
    }>;
}
