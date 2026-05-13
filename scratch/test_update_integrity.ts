import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 1. Get a random tower
  const tower = await prisma.tower.findFirst()
  if (!tower) {
    console.log('No towers found')
    return
  }
  console.log(`Found tower: ${tower.id} (${tower.nama})`)

  // 2. Update it
  console.log('Updating tower...')
  const updated = await prisma.tower.update({
    where: { id: tower.id },
    data: {
      hasCertificate: true
    }
  })
  console.log(`Updated tower: ${updated.id}, hasCertificate: ${updated.hasCertificate}`)

  // 3. Verify it's still in the list
  const found = await prisma.tower.findUnique({
    where: { id: tower.id }
  })
  if (found) {
    console.log('Tower STILL EXISTS in database')
  } else {
    console.log('CRITICAL: Tower GONE from database after update!')
  }

  // 4. Check total count
  const count = await prisma.tower.count()
  console.log(`Total count: ${count}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
