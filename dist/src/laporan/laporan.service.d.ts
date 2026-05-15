import { PrismaService } from '../prisma/prisma.service';
import { CreateLaporanDto } from './dto/create-laporan.dto';
import { UpdateLaporanDto } from './dto/update-laporan.dto';
import { QueryLaporanDto } from './dto/query-laporan.dto';
interface CurrentUser {
    id: string;
    role: string;
}
export declare class LaporanService {
    private prisma;
    constructor(prisma: PrismaService);
    private buildAccessWhere;
    assertAccessible(id: string, currentUser?: CurrentUser): Promise<{
        id: string;
        towerId: string;
        pelaporId: string;
    }>;
    findAll(query: QueryLaporanDto, currentUser?: CurrentUser): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string, currentUser?: CurrentUser): Promise<any>;
    getStats(currentUser?: CurrentUser): Promise<{
        total: number;
        berlangsung: number;
    }>;
    syncTowerStatus(towerId: string): Promise<void>;
    create(dto: CreateLaporanDto, pelaporId: string): Promise<any>;
    update(id: string, dto: UpdateLaporanDto, currentUser?: CurrentUser): Promise<any>;
    remove(id: string, currentUser?: CurrentUser): Promise<void>;
    updateFotoUrls(id: string, urls: string[], currentUser?: CurrentUser): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
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
        jenisGangguan: string;
        levelRisiko: string;
        lokasiDetail: string | null;
        contactPerson: string | null;
        progresLaporan: string | null;
    }>;
}
export {};
