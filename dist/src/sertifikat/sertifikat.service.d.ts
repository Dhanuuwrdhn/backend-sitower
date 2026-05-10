import { PrismaService } from '../prisma/prisma.service';
import { CreateFolderDto } from './dto/create-sertifikat.dto';
import { UpdateSertifikatDto } from './dto/update-sertifikat.dto';
export declare class SertifikatService {
    private prisma;
    constructor(prisma: PrismaService);
    findAllFolders(query?: {
        search?: string;
        kategori?: string;
        status?: string;
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
        createdAt: Date;
        updatedAt: Date;
        towerId: string | null;
        status: string;
        berlakuHingga: Date | null;
        kategori: string;
    })[]>;
    findFolder(id: string): Promise<{
        tower: {
            id: string;
            nama: string;
        } | null;
        dokumen: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            namaFile: string;
            fileUrl: string;
            folderId: string;
        }[];
    } & {
        id: string;
        nama: string;
        createdAt: Date;
        updatedAt: Date;
        towerId: string | null;
        status: string;
        berlakuHingga: Date | null;
        kategori: string;
    }>;
    createFolder(dto: CreateFolderDto): import("@prisma/client").Prisma.Prisma__SertifikatClient<{
        tower: {
            id: string;
            nama: string;
        } | null;
    } & {
        id: string;
        nama: string;
        createdAt: Date;
        updatedAt: Date;
        towerId: string | null;
        status: string;
        berlakuHingga: Date | null;
        kategori: string;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    updateFolder(id: string, dto: UpdateSertifikatDto): Promise<{
        id: string;
        nama: string;
        createdAt: Date;
        updatedAt: Date;
        towerId: string | null;
        status: string;
        berlakuHingga: Date | null;
        kategori: string;
    }>;
    deleteFolder(id: string): Promise<{
        id: string;
        nama: string;
        createdAt: Date;
        updatedAt: Date;
        towerId: string | null;
        status: string;
        berlakuHingga: Date | null;
        kategori: string;
    }>;
    findDokumenByFolder(folderId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        namaFile: string;
        fileUrl: string;
        folderId: string;
    }[]>;
    findDokumen(id: string): Promise<{
        folder: {
            id: string;
            nama: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        namaFile: string;
        fileUrl: string;
        folderId: string;
    }>;
    addDokumen(folderId: string, namaFile: string, fileUrl: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        namaFile: string;
        fileUrl: string;
        folderId: string;
    }>;
    deleteDokumen(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        namaFile: string;
        fileUrl: string;
        folderId: string;
    }>;
}
