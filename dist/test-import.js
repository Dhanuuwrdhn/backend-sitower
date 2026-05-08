"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const import_service_1 = require("./src/import/import.service");
const prisma = new client_1.PrismaClient();
const importService = new import_service_1.ImportService(prisma);
async function run() {
    const fs = require('fs');
    const buffer = fs.readFileSync('../frontend-sitower/Data PPL dan Kerawanan ULTG Durikosambi.xlsx');
    try {
        const result = await importService.importFile('laporan', buffer);
        console.log('Result:', result);
    }
    catch (e) {
        console.error('Error:', e);
    }
    finally {
        await prisma.$disconnect();
    }
}
run();
//# sourceMappingURL=test-import.js.map