import { LaporanService } from './laporan.service';
import { ProgressService } from './progress.service';
import { CreateLaporanDto } from './dto/create-laporan.dto';
import { UpdateLaporanDto } from './dto/update-laporan.dto';
import { QueryLaporanDto } from './dto/query-laporan.dto';
export declare class LaporanController {
    private laporanService;
    private progressService;
    constructor(laporanService: LaporanService, progressService: ProgressService);
    findAll(query: QueryLaporanDto, req: any): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
    }>;
    getStats(req: any): Promise<{
        total: number;
        berlangsung: number;
    }>;
    findOne(id: string, req: any): Promise<any>;
    create(dto: CreateLaporanDto, req: any): Promise<any>;
    uploadFoto(files: Express.Multer.File[], req: any): Promise<{
        urls: string[];
    }>;
    update(id: string, dto: UpdateLaporanDto, req: any): Promise<any>;
    remove(id: string, req: any): Promise<void>;
    getProgress(id: string, req: any): Promise<Record<string, {
        id: string;
        createdAt: Date;
        laporanId: string;
        tipe: string;
        fileUrl: string;
        namaFile: string;
    }[]>>;
    uploadProgress(id: string, file: Express.Multer.File, tipe: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        laporanId: string;
        tipe: string;
        fileUrl: string;
        namaFile: string;
    }>;
    deleteProgress(id: string, progressId: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        laporanId: string;
        tipe: string;
        fileUrl: string;
        namaFile: string;
    }>;
    getFotoHistory(id: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        laporanId: string;
        urls: string[];
    }[]>;
    getRiwayat(id: string, req: any): Promise<{
        statusKerawanan: string;
        progresLaporan: string;
        uraianPekerjaan: string | null;
        upayaPengendalian: string | null;
        pihakLain: string | null;
        contactPerson: string | null;
        foto: string[];
        id: string;
        tanggal: Date;
        createdAt: Date;
        laporanId: string;
        oleh: string;
        beritaAcara: string[];
        spanduk: string[];
        surat: string[];
        changedFields: string[];
    }[]>;
    addRiwayat(id: string, files: {
        foto?: Express.Multer.File[];
        beritaAcara?: Express.Multer.File[];
        spanduk?: Express.Multer.File[];
        surat?: Express.Multer.File[];
    }, body: any, req: any): Promise<{
        riwayat: {
            statusKerawanan: string;
            progresLaporan: string;
            uraianPekerjaan: string | null;
            upayaPengendalian: string | null;
            pihakLain: string | null;
            contactPerson: string | null;
            foto: string[];
            id: string;
            tanggal: Date;
            createdAt: Date;
            laporanId: string;
            oleh: string;
            beritaAcara: string[];
            spanduk: string[];
            surat: string[];
            changedFields: string[];
        };
        laporan: {
            pelapor: {
                id: string;
                nama: string;
                jabatan: string;
                unit: string;
            };
            tower: {
                id: string;
                nama: string;
                tegangan: string;
                tipe: string;
                lokasi: string | null;
            };
        } & {
            progresLaporan: string | null;
            contactPerson: string | null;
            foto: string[];
            id: string;
            towerId: string;
            pelaporId: string;
            deskripsi: string;
            status: string;
            tanggal: Date;
            keterangan: string | null;
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
        };
    }>;
    deleteRiwayat(id: string, riwayatId: string, req: any): Promise<{
        success: boolean;
    }>;
    uploadFotoUpdate(id: string, files: Express.Multer.File[], req: any): Promise<{
        id: string;
        createdAt: Date;
        laporanId: string;
        urls: string[];
    }>;
}
