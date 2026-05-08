import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  await prisma.laporan.deleteMany();
  await prisma.tower.deleteMany();
  console.log('Database cleared!');
}
run();
