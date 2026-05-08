import { PrismaService } from '../prisma/prisma.service';
import { CreateAsBuiltDrawingDto } from './dto/create-as-built-drawing.dto';
import { UpdateAsBuiltDrawingDto } from './dto/update-as-built-drawing.dto';
export declare class AsBuiltDrawingService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(query?: {
        towerId?: string;
        tipe?: string;
        tahun?: number;
    }): import("@prisma/client").Prisma.PrismaPromise<({
        tower: {
            id: string;
            nama: string;
        };
    } & {
        id: string;
        tipe: string;
        createdAt: Date;
        updatedAt: Date;
        keterangan: string | null;
        towerId: string;
        tahun: number;
        fileUrl: string | null;
        namaFile: string;
        versi: string | null;
    })[]>;
    findOne(id: string): Promise<{
        tower: {
            id: string;
            nama: string;
        };
    } & {
        id: string;
        tipe: string;
        createdAt: Date;
        updatedAt: Date;
        keterangan: string | null;
        towerId: string;
        tahun: number;
        fileUrl: string | null;
        namaFile: string;
        versi: string | null;
    }>;
    create(dto: CreateAsBuiltDrawingDto): import("@prisma/client").Prisma.Prisma__AsBuiltDrawingClient<{
        id: string;
        tipe: string;
        createdAt: Date;
        updatedAt: Date;
        keterangan: string | null;
        towerId: string;
        tahun: number;
        fileUrl: string | null;
        namaFile: string;
        versi: string | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, dto: UpdateAsBuiltDrawingDto): Promise<{
        id: string;
        tipe: string;
        createdAt: Date;
        updatedAt: Date;
        keterangan: string | null;
        towerId: string;
        tahun: number;
        fileUrl: string | null;
        namaFile: string;
        versi: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        tipe: string;
        createdAt: Date;
        updatedAt: Date;
        keterangan: string | null;
        towerId: string;
        tahun: number;
        fileUrl: string | null;
        namaFile: string;
        versi: string | null;
    }>;
    updateFileUrl(id: string, fileUrl: string): Promise<{
        id: string;
        tipe: string;
        createdAt: Date;
        updatedAt: Date;
        keterangan: string | null;
        towerId: string;
        tahun: number;
        fileUrl: string | null;
        namaFile: string;
        versi: string | null;
    }>;
}
