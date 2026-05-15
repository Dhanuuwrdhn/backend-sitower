import type { Response } from 'express';
import { AsBuiltDrawingService } from './as-built-drawing.service';
import { CreateFolderDto } from './dto/create-as-built-drawing.dto';
import { UpdateAsBuiltDrawingDto } from './dto/update-as-built-drawing.dto';
export declare class AsBuiltDrawingController {
    private asBuiltDrawingService;
    constructor(asBuiltDrawingService: AsBuiltDrawingService);
    findAll(query: {
        search?: string;
        tipe?: string;
        tahun?: string;
        towerId?: string;
    }): import("@prisma/client").Prisma.PrismaPromise<({
        tower: {
            id: string;
            nama: string;
        } | null;
        _count: {
            dokumen: number;
        };
    } & {
        id: string;
        nama: string;
        tipe: string;
        createdAt: Date;
        updatedAt: Date;
        towerId: string | null;
        keterangan: string | null;
        tahun: number;
    })[]>;
    findFolder(id: string): Promise<{
        tower: {
            id: string;
            nama: string;
        } | null;
        _count: {
            dokumen: number;
        };
        dokumen: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            fileUrl: string;
            namaFile: string;
            folderId: string;
        }[];
    } & {
        id: string;
        nama: string;
        tipe: string;
        createdAt: Date;
        updatedAt: Date;
        towerId: string | null;
        keterangan: string | null;
        tahun: number;
    }>;
    createFolder(dto: CreateFolderDto): import("@prisma/client").Prisma.Prisma__AsBuiltFolderClient<{
        tower: {
            id: string;
            nama: string;
        } | null;
        _count: {
            dokumen: number;
        };
    } & {
        id: string;
        nama: string;
        tipe: string;
        createdAt: Date;
        updatedAt: Date;
        towerId: string | null;
        keterangan: string | null;
        tahun: number;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    updateFolder(id: string, dto: UpdateAsBuiltDrawingDto): Promise<{
        tower: {
            id: string;
            nama: string;
        } | null;
        _count: {
            dokumen: number;
        };
    } & {
        id: string;
        nama: string;
        tipe: string;
        createdAt: Date;
        updatedAt: Date;
        towerId: string | null;
        keterangan: string | null;
        tahun: number;
    }>;
    deleteFolder(id: string): Promise<{
        id: string;
        nama: string;
        tipe: string;
        createdAt: Date;
        updatedAt: Date;
        towerId: string | null;
        keterangan: string | null;
        tahun: number;
    }>;
    findDokumen(folderId: string): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        fileUrl: string;
        namaFile: string;
        folderId: string;
    }[]>;
    uploadDokumen(folderId: string, file: Express.Multer.File): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        fileUrl: string;
        namaFile: string;
        folderId: string;
    }>;
    findOneDokumen(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        fileUrl: string;
        namaFile: string;
        folderId: string;
    }>;
    previewDokumen(id: string, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deleteDokumen(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        fileUrl: string;
        namaFile: string;
        folderId: string;
    }>;
}
