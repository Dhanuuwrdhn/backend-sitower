import { PrismaService } from '../prisma/prisma.service';
export declare class ImportService {
    private prisma;
    constructor(prisma: PrismaService);
    generateTowerTemplate(): Promise<Buffer>;
    importFile(type: string, buffer: Buffer): Promise<{
        message: string;
        total: number;
    }>;
    private importTowers;
    private importSertifikat;
    private normalizeStatus;
    private normalizeJenis;
    private readonly LEVEL_PRIORITY;
    private readonly KERAWANAN_TYPES;
    private syncTowerStatus;
    private importLaporan;
}
