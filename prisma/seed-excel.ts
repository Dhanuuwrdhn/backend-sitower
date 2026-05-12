/**
 * Seed tower data from "Data Koordinat Jaringan.xlsx" (KOORDINAT TOWER sheet).
 * Imports only actual TOWER rows (TOWER 150 / TOWER 500), skips SPAN/JOINT.
 *
 * Usage:
 *   npx ts-node --project tsconfig.json -r tsconfig-paths/register prisma/seed-excel.ts
 */

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as XLSX from 'xlsx'
import * as path from 'path'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma  = new PrismaClient({ adapter } as any)

// ── Helpers ───────────────────────────────────────────────────────────────────

function slugify(str: string): string {
  return str
    .replace(/[^\w\s#\-\.]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .toUpperCase()
    .substring(0, 80)
}

function parseTegangan(towerCol: string): string {
  if (towerCol === 'TOWER 500') return '500kV'
  if (towerCol === 'TOWER 150') return '150kV'
  return '150kV'
}

function parseTipe(nama: string): string {
  if (nama.includes('SUTET')) return 'SUTET'
  if (nama.includes('SKTT'))  return 'SKTT'
  return 'SUTT'
}

// Extract jalur route from tower name, e.g. "TOWER SUTT 150kV KMBNG-PTKG #0021" → "KMBNG-PTKG"
function parseJalur(nama: string): string | null {
  const m = nama.match(/\d+kV\s+([A-Z0-9\+\-]+)\s+#/)
  return m ? m[1] : null
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const excelPath = path.join(__dirname, '..', '..', 'frontend-sitower', 'Data Koordinat Jaringan.xlsx')
  const wb = XLSX.readFile(excelPath)
  const ws = wb.Sheets['KOORDINAT TOWER']
  const allRows = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1, raw: true }) as any[][]

  // Filter: only TOWER 150 / TOWER 500, must have lat + lng
  const towerRows = allRows.slice(1).filter((r) => {
    const towerCol = String(r[3] || '').trim()
    const lat = parseFloat(String(r[4] || ''))
    const lng = parseFloat(String(r[5] || ''))
    return (towerCol === 'TOWER 150' || towerCol === 'TOWER 500') && !isNaN(lat) && !isNaN(lng)
  })

  console.log(`Total tower rows to import: ${towerRows.length}`)

  // Delete existing tower data (cascades to laporan, sertifikat, asBuilt)
  console.log('Deleting existing tower data...')
  await prisma.$executeRawUnsafe('DELETE FROM "Tower" CASCADE')
  await prisma.$executeRawUnsafe('DELETE FROM "JalurKML" CASCADE')
  console.log('Deleted.')

  let inserted = 0
  const idSet = new Set<string>()

  for (const row of towerRows) {
    const lokasi    = String(row[1] || '').trim()
    const namaRaw   = String(row[2] || '').trim()
    const towerCol  = String(row[3] || '').trim()
    const lat       = parseFloat(String(row[4]).trim())
    const lng       = parseFloat(String(row[5]).trim())

    if (!namaRaw) continue

    const tegangan = parseTegangan(towerCol)
    const tipe     = parseTipe(namaRaw)
    const jalur    = parseJalur(namaRaw)

    // Generate unique ID from tower name
    let id = slugify(namaRaw)
    // Deduplicate — shouldn't happen but guard anyway
    let suffix = 0
    while (idSet.has(id)) {
      suffix++
      id = `${slugify(namaRaw)}-${suffix}`
    }
    idSet.add(id)

    await prisma.tower.create({
      data: {
        id,
        nama:     namaRaw,
        lat,
        lng,
        tegangan,
        tipe,
        kondisi:  'normal',
        lokasi:   lokasi || null,
        jalur:    jalur || null,
      },
    })
    inserted++
  }

  console.log(`✓ Done: ${inserted} tower imported, ${towerRows.length - inserted} skipped`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
