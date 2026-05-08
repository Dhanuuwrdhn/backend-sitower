import { PrismaService } from './src/prisma/prisma.service';
import * as XLSX from 'xlsx';
import { ImportService } from './src/import/import.service';

const prisma = new PrismaService();
const importService = new ImportService(prisma);

async function run() {
  const fs = require('fs');
  const buffer = fs.readFileSync('../frontend-sitower/Data PPL dan Kerawanan ULTG Durikosambi.xlsx');
  try {
    const result = await importService.importFile('laporan', buffer);
    console.log('Result:', result);
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}
run();
