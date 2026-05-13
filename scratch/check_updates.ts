import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const count = await prisma.tower.count()
  console.log(`Total towers: ${count}`)
  
  const lastUpdate = await prisma.tower.findMany({
    orderBy: { updatedAt: 'desc' },
    take: 5,
    select: {
      id: true,
      nama: true,
      updatedAt: true
    }
  })
  console.log('Last updated towers:')
  console.log(JSON.stringify(lastUpdate, null, 2))
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
