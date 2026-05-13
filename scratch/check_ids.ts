import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const towers = await prisma.tower.findMany({
    take: 10,
    select: {
      id: true,
      nama: true
    }
  })
  console.log(JSON.stringify(towers, null, 2))
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
