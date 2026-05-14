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
        tipe: string;
        createdAt: Date;
        namaFile: string;
        fileUrl: string;
        laporanId: string;
    }[]>>;
    uploadProgress(id: string, file: Express.Multer.File, tipe: string, req: any): Promise<{
        id: string;
        tipe: string;
        createdAt: Date;
        namaFile: string;
        fileUrl: string;
        laporanId: string;
    }>;
    deleteProgress(id: string, progressId: string): Promise<{
        id: string;
        tipe: string;
        createdAt: Date;
        namaFile: string;
        fileUrl: string;
        laporanId: string;
    }>;
    getFotoHistory(id: string): Promise<{
        id: string;
        createdAt: Date;
        laporanId: string;
        urls: string[];
    }[]>;
    getRiwayat(id: string): Promise<{
        id: string;
        createdAt: Date;
        statusKerawanan: string;
        tanggal: Date;
        foto: string[];
        contactPerson: string | null;
        progresLaporan: string;
        laporanId: string;
        spanduk: string[];
        oleh: string;
        uraianPekerjaan: string | null;
        upayaPengendalian: string | null;
        pihakLain: string | null;
        beritaAcara: string[];
        surat: string[];
    }[]>;
    addRiwayat(id: string, files: {
        foto?: Express.Multer.File[];
        beritaAcara?: Express.Multer.File[];
        spanduk?: Express.Multer.File[];
        surat?: Express.Multer.File[];
    }, body: any, req: any): Promise<{
        id: string;
        createdAt: Date;
        statusKerawanan: string;
        tanggal: Date;
        foto: string[];
        contactPerson: string | null;
        progresLaporan: string;
        laporanId: string;
        spanduk: string[];
        oleh: string;
        uraianPekerjaan: string | null;
        upayaPengendalian: string | null;
        pihakLain: string | null;
        beritaAcara: string[];
        surat: string[];
    }>;
    deleteRiwayat(id: string, riwayatId: string): Promise<{
        id: string;
        createdAt: Date;
        statusKerawanan: string;
        tanggal: Date;
        foto: string[];
        contactPerson: string | null;
        progresLaporan: string;
        laporanId: string;
        spanduk: string[];
        oleh: string;
        uraianPekerjaan: string | null;
        upayaPengendalian: string | null;
        pihakLain: string | null;
        beritaAcara: string[];
        surat: string[];
    }>;
    uploadFotoUpdate(id: string, files: Express.Multer.File[], req: any): Promise<{
        id: string;
        createdAt: Date;
        laporanId: string;
        urls: string[];
    }>;
}
