import { PrismaService } from '../prisma/prisma.service';
import { CreateLaporanDto } from './dto/create-laporan.dto';
import { UpdateLaporanDto } from './dto/update-laporan.dto';
import { QueryLaporanDto } from './dto/query-laporan.dto';
export declare class LaporanService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(query: QueryLaporanDto): Promise<{
        data: ({
            tower: {
                id: string;
                nama: string;
                tegangan: string;
                tipe: string;
                lokasi: string | null;
            };
            pelapor: {
                id: string;
                nama: string;
                jabatan: string;
                unit: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            foto: string[];
            teknisi: string | null;
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
            towerId: string;
            pelaporId: string;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string): Promise<{
        tower: {
            id: string;
            nama: string;
            tegangan: string;
            tipe: string;
            lokasi: string | null;
        };
        pelapor: {
            id: string;
            nama: string;
            jabatan: string;
            unit: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        foto: string[];
        teknisi: string | null;
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
        towerId: string;
        pelaporId: string;
    }>;
    getStats(): Promise<{
        total: number;
        berlangsung: number;
    }>;
    create(dto: CreateLaporanDto, pelaporId: string): import("@prisma/client").Prisma.Prisma__LaporanClient<{
        tower: {
            id: string;
            nama: string;
            tegangan: string;
            tipe: string;
            lokasi: string | null;
        };
        pelapor: {
            id: string;
            nama: string;
            jabatan: string;
            unit: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        foto: string[];
        teknisi: string | null;
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
        towerId: string;
        pelaporId: string;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, dto: UpdateLaporanDto): Promise<{
        tower: {
            id: string;
            nama: string;
            tegangan: string;
            tipe: string;
            lokasi: string | null;
        };
        pelapor: {
            id: string;
            nama: string;
            jabatan: string;
            unit: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        foto: string[];
        teknisi: string | null;
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
        towerId: string;
        pelaporId: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        foto: string[];
        teknisi: string | null;
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
        towerId: string;
        pelaporId: string;
    }>;
    updateFotoUrls(id: string, urls: string[]): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        foto: string[];
        teknisi: string | null;
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
        towerId: string;
        pelaporId: string;
    }>;
}
