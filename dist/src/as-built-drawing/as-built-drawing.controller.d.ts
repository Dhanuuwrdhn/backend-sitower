import type { Response } from 'express';
import { AsBuiltDrawingService } from './as-built-drawing.service';
import { CreateFolderDto } from './dto/create-as-built-drawing.dto';
import { UpdateAsBuiltDrawingDto } from './dto/update-as-built-drawing.dto';
import { BulkDeleteDto } from './dto/bulk-delete.dto';
export declare class AsBuiltDrawingController {
    private asBuiltDrawingService;
    constructor(asBuiltDrawingService: AsBuiltDrawingService);
    findAll(query: {
        search?: string;
        tipe?: string;
        tahun?: string;
        towerId?: string;
        parentId?: string;
    }): Promise<{
        folders: ({
            tower: {
                id: string;
                nama: string;
            } | null;
            _count: {
                dokumen: number;
                children: number;
            };
            createdBy: {
                id: string;
                nama: string;
                role: string;
            } | null;
        } & {
            id: string;
            towerId: string | null;
            keterangan: string | null;
            createdAt: Date;
            updatedAt: Date;
            nama: string;
            tipe: string;
            tahun: number;
            parentId: string | null;
            createdById: string | null;
        })[];
        rootDokumen: never[] | ({
            createdBy: {
                id: string;
                nama: string;
                role: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            fileUrl: string;
            namaFile: string;
            createdById: string | null;
            folderId: string | null;
        })[];
    }>;
    breadcrumb(id: string): Promise<{
        id: string;
        nama: string;
    }[]>;
    findFolder(id: string): Promise<{
        tower: {
            id: string;
            nama: string;
        } | null;
        _count: {
            dokumen: number;
            children: number;
        };
        dokumen: ({
            createdBy: {
                id: string;
                nama: string;
                role: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            fileUrl: string;
            namaFile: string;
            createdById: string | null;
            folderId: string | null;
        })[];
        children: ({
            tower: {
                id: string;
                nama: string;
            } | null;
            _count: {
                dokumen: number;
                children: number;
            };
            createdBy: {
                id: string;
                nama: string;
                role: string;
            } | null;
        } & {
            id: string;
            towerId: string | null;
            keterangan: string | null;
            createdAt: Date;
            updatedAt: Date;
            nama: string;
            tipe: string;
            tahun: number;
            parentId: string | null;
            createdById: string | null;
        })[];
        parent: {
            id: string;
            nama: string;
            parentId: string | null;
        } | null;
        createdBy: {
            id: string;
            nama: string;
            role: string;
        } | null;
    } & {
        id: string;
        towerId: string | null;
        keterangan: string | null;
        createdAt: Date;
        updatedAt: Date;
        nama: string;
        tipe: string;
        tahun: number;
        parentId: string | null;
        createdById: string | null;
    }>;
    createFolder(dto: CreateFolderDto, req: any): import("@prisma/client").Prisma.Prisma__AsBuiltFolderClient<{
        tower: {
            id: string;
            nama: string;
        } | null;
        _count: {
            dokumen: number;
            children: number;
        };
        createdBy: {
            id: string;
            nama: string;
            role: string;
        } | null;
    } & {
        id: string;
        towerId: string | null;
        keterangan: string | null;
        createdAt: Date;
        updatedAt: Date;
        nama: string;
        tipe: string;
        tahun: number;
        parentId: string | null;
        createdById: string | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    updateFolder(id: string, dto: UpdateAsBuiltDrawingDto): Promise<{
        tower: {
            id: string;
            nama: string;
        } | null;
        _count: {
            dokumen: number;
            children: number;
        };
        createdBy: {
            id: string;
            nama: string;
            role: string;
        } | null;
    } & {
        id: string;
        towerId: string | null;
        keterangan: string | null;
        createdAt: Date;
        updatedAt: Date;
        nama: string;
        tipe: string;
        tahun: number;
        parentId: string | null;
        createdById: string | null;
    }>;
    deleteFolder(id: string): Promise<{
        id: string;
        towerId: string | null;
        keterangan: string | null;
        createdAt: Date;
        updatedAt: Date;
        nama: string;
        tipe: string;
        tahun: number;
        parentId: string | null;
        createdById: string | null;
    }>;
    bulkDelete(dto: BulkDeleteDto): Promise<{
        deletedFolders: number;
        deletedDokumens: number;
    }>;
    findDokumen(folderId: string): import("@prisma/client").Prisma.PrismaPromise<({
        createdBy: {
            id: string;
            nama: string;
            role: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        fileUrl: string;
        namaFile: string;
        createdById: string | null;
        folderId: string | null;
    })[]>;
    uploadRootDokumen(files: Express.Multer.File[], req: any): Promise<{
        count: number;
        docs: ({
            createdBy: {
                id: string;
                nama: string;
                role: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            fileUrl: string;
            namaFile: string;
            createdById: string | null;
            folderId: string | null;
        })[];
    }>;
    uploadDokumen(folderId: string, files: Express.Multer.File[], req: any): Promise<{
        count: number;
        docs: ({
            createdBy: {
                id: string;
                nama: string;
                role: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            fileUrl: string;
            namaFile: string;
            createdById: string | null;
            folderId: string | null;
        })[];
    }>;
    findOneDokumen(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        fileUrl: string;
        namaFile: string;
        createdById: string | null;
        folderId: string | null;
    }>;
    previewDokumen(id: string, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deleteDokumen(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        fileUrl: string;
        namaFile: string;
        createdById: string | null;
        folderId: string | null;
    }>;
}
