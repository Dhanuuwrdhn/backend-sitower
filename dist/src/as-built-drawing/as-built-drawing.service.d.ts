import { PrismaService } from '../prisma/prisma.service';
import { CreateFolderDto } from './dto/create-as-built-drawing.dto';
import { UpdateAsBuiltDrawingDto } from './dto/update-as-built-drawing.dto';
export declare class AsBuiltDrawingService {
    private prisma;
    constructor(prisma: PrismaService);
    findAllFolders(query: {
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
    breadcrumb(id: string): Promise<{
        id: string;
        nama: string;
    }[]>;
    createFolder(dto: CreateFolderDto, createdById?: string): import("@prisma/client").Prisma.Prisma__AsBuiltFolderClient<{
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
    findDokumenByFolder(folderId: string): import("@prisma/client").Prisma.PrismaPromise<({
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
    findDokumen(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        fileUrl: string;
        namaFile: string;
        createdById: string | null;
        folderId: string | null;
    }>;
    addDokumenMulti(folderId: string | null, docs: {
        namaFile: string;
        fileUrl: string;
    }[], createdById?: string): Promise<{
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
    deleteDokumen(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        fileUrl: string;
        namaFile: string;
        createdById: string | null;
        folderId: string | null;
    }>;
    bulkDelete(folderIds: string[], dokumenIds: string[]): Promise<{
        deletedFolders: number;
        deletedDokumens: number;
    }>;
}
