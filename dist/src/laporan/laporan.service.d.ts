import { PrismaService } from '../prisma/prisma.service';
import { CreateLaporanDto } from './dto/create-laporan.dto';
import { UpdateLaporanDto } from './dto/update-laporan.dto';
import { QueryLaporanDto } from './dto/query-laporan.dto';
export declare class LaporanService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(query: QueryLaporanDto): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string): Promise<any>;
    getStats(): Promise<{
        total: number;
        berlangsung: number;
    }>;
    create(dto: CreateLaporanDto, pelaporId: string): Promise<any>;
    update(id: string, dto: UpdateLaporanDto): Promise<any>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        foto: string[];
        teknisi: string | null;
        towerId: string;
        pelaporId: string;
        jenisGangguan: string;
        deskripsi: string;
        levelRisiko: string;
        status: string;
        tanggal: Date;
        lokasiDetail: string | null;
        keterangan: string | null;
        noSpk: string | null;
        temuan: string | null;
        hasil: string | null;
        penyebab: string | null;
        durasi: string | null;
    }>;
    updateFotoUrls(id: string, urls: string[]): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        foto: string[];
        teknisi: string | null;
        towerId: string;
        pelaporId: string;
        jenisGangguan: string;
        deskripsi: string;
        levelRisiko: string;
        status: string;
        tanggal: Date;
        lokasiDetail: string | null;
        keterangan: string | null;
        noSpk: string | null;
        temuan: string | null;
        hasil: string | null;
        penyebab: string | null;
        durasi: string | null;
    }>;
}
