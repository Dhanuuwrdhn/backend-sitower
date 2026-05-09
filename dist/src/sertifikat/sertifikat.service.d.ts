import { PrismaService } from '../prisma/prisma.service';
import { CreateSertifikatDto } from './dto/create-sertifikat.dto';
import { UpdateSertifikatDto } from './dto/update-sertifikat.dto';
export declare class SertifikatService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(query?: {
        towerId?: string;
        status?: string;
        tipe?: string;
    }): import("@prisma/client").Prisma.PrismaPromise<({
        tower: {
            id: string;
            nama: string;
        };
    } & {
        id: string;
        nama: string;
        tipe: string;
        createdAt: Date;
        updatedAt: Date;
        towerId: string;
        status: string;
        berlakuHingga: Date;
        fileUrl: string | null;
    })[]>;
    findOne(id: string): Promise<{
        tower: {
            id: string;
            nama: string;
        };
    } & {
        id: string;
        nama: string;
        tipe: string;
        createdAt: Date;
        updatedAt: Date;
        towerId: string;
        status: string;
        berlakuHingga: Date;
        fileUrl: string | null;
    }>;
    create(dto: CreateSertifikatDto): import("@prisma/client").Prisma.Prisma__SertifikatClient<{
        id: string;
        nama: string;
        tipe: string;
        createdAt: Date;
        updatedAt: Date;
        towerId: string;
        status: string;
        berlakuHingga: Date;
        fileUrl: string | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, dto: UpdateSertifikatDto): Promise<{
        id: string;
        nama: string;
        tipe: string;
        createdAt: Date;
        updatedAt: Date;
        towerId: string;
        status: string;
        berlakuHingga: Date;
        fileUrl: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        nama: string;
        tipe: string;
        createdAt: Date;
        updatedAt: Date;
        towerId: string;
        status: string;
        berlakuHingga: Date;
        fileUrl: string | null;
    }>;
    updateFileUrl(id: string, fileUrl: string): Promise<{
        id: string;
        nama: string;
        tipe: string;
        createdAt: Date;
        updatedAt: Date;
        towerId: string;
        status: string;
        berlakuHingga: Date;
        fileUrl: string | null;
    }>;
}
