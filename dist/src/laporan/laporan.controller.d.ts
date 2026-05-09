import { LaporanService } from './laporan.service';
import { CreateLaporanDto } from './dto/create-laporan.dto';
import { UpdateLaporanDto } from './dto/update-laporan.dto';
import { QueryLaporanDto } from './dto/query-laporan.dto';
export declare class LaporanController {
    private laporanService;
    constructor(laporanService: LaporanService);
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
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    getStats(): Promise<{
        total: number;
        berlangsung: number;
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
    create(dto: CreateLaporanDto, req: any): import("@prisma/client").Prisma.Prisma__LaporanClient<{
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
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    uploadFoto(files: Express.Multer.File[], req: any): Promise<{
        urls: string[];
    }>;
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
}
