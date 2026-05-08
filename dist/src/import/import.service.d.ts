import { PrismaService } from '../prisma/prisma.service';
export declare class ImportService {
    private prisma;
    constructor(prisma: PrismaService);
    importFile(type: string, buffer: Buffer): Promise<{
        message: string;
        total: number;
    }>;
    private importTowers;
    private importSertifikat;
    private importLaporan;
}
