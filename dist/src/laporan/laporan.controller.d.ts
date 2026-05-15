import { LaporanService } from './laporan.service';
import { ProgressService } from './progress.service';
import { CreateLaporanDto } from './dto/create-laporan.dto';
import { UpdateLaporanDto } from './dto/update-laporan.dto';
import { QueryLaporanDto } from './dto/query-laporan.dto';
export declare class LaporanController {
    private laporanService;
    private progressService;
    constructor(laporanService: LaporanService, progressService: ProgressService);
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
    remove(id: string): Promise<void>;
    getProgress(id: string): Promise<Record<string, {
        id: string;
        createdAt: Date;
        tipe: string;
        laporanId: string;
        fileUrl: string;
        namaFile: string;
    }[]>>;
    uploadProgress(id: string, file: Express.Multer.File, tipe: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        tipe: string;
        laporanId: string;
        fileUrl: string;
        namaFile: string;
    }>;
    deleteProgress(id: string, progressId: string): Promise<{
        id: string;
        createdAt: Date;
        tipe: string;
        laporanId: string;
        fileUrl: string;
        namaFile: string;
    }>;
    getFotoHistory(id: string): Promise<{
        id: string;
        createdAt: Date;
        laporanId: string;
        urls: string[];
    }[]>;
    getRiwayat(id: string): Promise<any>;
    addRiwayat(id: string, files: {
        foto?: Express.Multer.File[];
        beritaAcara?: Express.Multer.File[];
        spanduk?: Express.Multer.File[];
        surat?: Express.Multer.File[];
    }, body: any, req: any): Promise<{
        riwayat: any;
        laporan: any;
    }>;
    deleteRiwayat(id: string, riwayatId: string): Promise<any>;
    uploadFotoUpdate(id: string, files: Express.Multer.File[], req: any): Promise<{
        id: string;
        createdAt: Date;
        laporanId: string;
        urls: string[];
    }>;
}
