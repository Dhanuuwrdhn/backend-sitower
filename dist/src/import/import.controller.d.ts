import { ImportService } from './import.service';
export declare class ImportController {
    private importService;
    constructor(importService: ImportService);
    importFile(type: string, file: Express.Multer.File): Promise<{
        message: string;
        total: number;
    }>;
}
