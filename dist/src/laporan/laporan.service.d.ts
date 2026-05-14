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
    private syncTowerStatus;
    create(dto: CreateLaporanDto, pelaporId: string): Promise<any>;
    update(id: string, dto: UpdateLaporanDto): Promise<any>;
    remove(id: string): Promise<void>;
    updateFotoUrls(id: string, urls: string[]): Promise<{
        id: string;
        towerId: string;
        pelaporId: string;
        deskripsi: string;
        status: string;
        tanggal: Date;
        keterangan: string | null;
        foto: string[];
        noSpk: string | null;
        teknisi: string | null;
        temuan: string | null;
        hasil: string | null;
        penyebab: string | null;
        durasi: string | null;
        createdAt: Date;
        updatedAt: Date;
        jenisGangguan: string;
        levelRisiko: string;
        lokasiDetail: string | null;
        contactPerson: string | null;
        progresLaporan: string | null;
    }>;
}
