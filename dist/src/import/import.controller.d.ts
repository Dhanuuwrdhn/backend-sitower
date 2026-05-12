import type { Response } from 'express';
import { ImportService } from './import.service';
export declare class ImportController {
    private importService;
    constructor(importService: ImportService);
    downloadTowerTemplate(res: Response): Promise<void>;
    importFile(type: string, file: Express.Multer.File): Promise<{
        message: string;
        total: number;
    }>;
}
