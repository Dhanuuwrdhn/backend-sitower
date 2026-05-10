import { LaporanService } from './laporan.service';
import { CreateLaporanDto } from './dto/create-laporan.dto';
import { UpdateLaporanDto } from './dto/update-laporan.dto';
import { QueryLaporanDto } from './dto/query-laporan.dto';
export declare class LaporanController {
    private laporanService;
    constructor(laporanService: LaporanService);
    findAll(query: QueryLaporanDto): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
    }>;
    getStats(): Promise<{
        total: number;
        berlangsung: number;
    }>;
    findOne(id: string): Promise<any>;
    create(dto: CreateLaporanDto, req: any): Promise<any>;
    uploadFoto(files: Express.Multer.File[], req: any): Promise<{
        urls: string[];
    }>;
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
}
