"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function run() {
    await prisma.laporan.deleteMany();
    await prisma.tower.deleteMany();
    console.log('Database cleared!');
}
run();
//# sourceMappingURL=clear-db.js.map