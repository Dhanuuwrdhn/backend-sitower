import { PrismaClient } from '@prisma/client'
import { INITIAL_RIWAYAT_FIELDS } from './src/laporan/laporan.service'

const prisma = new PrismaClient()

async function run() {
  const laporans = await prisma.laporan.findMany({
    include: { pelapor: { select: { nama: true } } },
  })

  let created = 0
  let skipped = 0

  for (const l of laporans) {
    const hasInitial = await prisma.riwayatLaporan.findFirst({
      where: { laporanId: l.id, changedFields: { has: '__initial__' } },
      select: { id: true },
    })
    if (hasInitial) {
      skipped++
      continue
    }

    await prisma.riwayatLaporan.create({
      data: {
        laporanId: l.id,
        oleh: l.pelapor?.nama ?? 'Sistem',
        tanggal: l.createdAt,
        statusKerawanan: l.levelRisiko,
        progresLaporan: l.progresLaporan ?? 'sedang_berlangsung',
        uraianPekerjaan: l.deskripsi ?? null,
        upayaPengendalian: l.keterangan ?? null,
        pihakLain: l.teknisi ?? null,
        contactPerson: l.contactPerson ?? null,
        foto: l.foto ?? [],
        beritaAcara: [],
        spanduk: [],
        surat: [],
        changedFields: INITIAL_RIWAYAT_FIELDS,
      },
    })
    created++
    console.log(`Backfilled initial riwayat for laporan ${l.id}`)
  }

  console.log(`\nDone. created=${created} skipped=${skipped} total=${laporans.length}`)
  await prisma.$disconnect()
}

run().catch(async (e) => {
  console.error(e)
  await prisma.$disconnect()
  process.exit(1)
})
