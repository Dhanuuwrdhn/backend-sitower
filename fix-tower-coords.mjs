/**
 * fix-tower-coords.mjs
 * Mencocokkan tower dari Excel (lat=0,lng=0) dengan koordinat dari KML geodata
 * lalu update database PostgreSQL
 * 
 * Mapping RUAS Excel -> line code KML:
 *   SUTT CENGKARENG BARU - ITS - TANGERANG BARU  -> CKRBR-TGBRU
 *   SUTT DURIKOSAMBI - CENGKARENG                -> DKSBI-CKRNG atau DKSBI-CGKRG
 *   SUTET DURIKOSAMBI - KEMBANGAN                -> DKSBI-GRLBR atau DNMGT-DKSBI
 *   SUTT KEMBANGAN - PETUKANGAN                  -> KMBNG-PTKNG
 *   SUTET GANDUL - KEMBANGAN                     -> GNDUL-KMBNG
 *   SUTT TANGERANG - CENGKARENG                  -> TGRNG-CKRNG
 *   SKTT KEMBANGAN - PETUKANGAN                  -> KMBNG-PTKNG (SKTT)
 *   SKTT ALAM SUTERA - SUMMARECON                -> ALSTA-CKUPA
 *   SKTT DURIKOSAMBI - KEMBANGAN                 -> DKSBI-KBJRK (SKTT)
 */

import pg from 'pg'
import { readFileSync } from 'fs'

const { Client } = pg

// ── Load geodata ─────────────────────────────────────────────────────────────
const geoRaw = readFileSync('/Volumes/project-danu/bornworks/frontend-sitower/output_geodata.ts', 'utf-8')
const pointsMatch = geoRaw.match(/export const newPoints = (\[.*?\]);/s)
if (!pointsMatch) throw new Error('Tidak bisa parse newPoints dari output_geodata.ts')
const allPoints = JSON.parse(pointsMatch[1])
console.log(`📡 Total geodata points: ${allPoints.length}`)

// ── Mapping RUAS -> line code KML (sebagai substring dari nama tower) ─────────
const RUAS_TO_KML_CODE = {
  'SUTT 150KV CENGKARENG BARU - ITS - TANGERANG BARU':  ['CKRBR-TGBRU'],
  'SUTT 150 KV CENGKARENG BARU - ITS - TANGERANG BARU': ['CKRBR-TGBRU'],
  'SUTT 150KV DURIKOSAMBI - CENGKARENG':                ['DKSBI-CGKRG', 'DKSBI-CKRNG', 'DKSBI-TGRLM'],
  'SUTT 150 KV DURIKOSAMBI - CENGKARENG':              ['DKSBI-CGKRG', 'DKSBI-CKRNG', 'DKSBI-TGRLM'],
  'SUTET 500KV DURIKOSAMBI - KEMBANGAN':               ['DKSBI-GRLBR', 'DNMGT-DKSBI', 'MKRNG-DKSBI'],
  'SUTET 500 KV DURIKOSAMBI - KEMBANGAN':              ['DKSBI-GRLBR', 'DNMGT-DKSBI', 'MKRNG-DKSBI'],
  'SUTT 150KV KEMBANGAN - PETUKANGAN':                 ['KMBNG-PTKNG'],
  'SUTT 150 KV KEMBANGAN - PETUKANGAN':                ['KMBNG-PTKNG'],
  'SUTET 500KV GANDUL - KEMBANGAN':                    ['GNDUL-KMBNG'],
  'SUTET 500 KV GANDUL - KEMBANGAN':                   ['GNDUL-KMBNG'],
  'SUTT 150 KV TANGERANG - CENGKARENG':                ['TGRNG-CKRNG'],
  'SKTT 150KV KEMBANGAN - PETUKANGAN':                 ['KMBNG-PTKNG'],
  'SKTT 150KV ALAM SUTERA - SUMMARECON GADING SERPONG':['ALSTA-CKUPA'],
  'SKTT 150KV DURIKOSAMBI - KEMBANGAN':               ['DKSBI-KBJRK', 'DKSBI-GRLBR'],
}

// ── Fungsi: Extract nomor tower dari nama KML ────────────────────────────────
// "TOWER SUTT 150kV DKSBI-CGKRG #T7" -> "T7"
// "TOWER SUTT 150kV DKSBI-CGKRG #TA4" -> "TA4"  
// "JALUR SKTT 150kV DKSBI-KBJRK #JP3" -> "JP3"
function extractTowerNum(kmlName) {
  // Match #LABEL at end
  const m = kmlName.match(/#([A-Z0-9]+[A-Z]?)(?:\s|$)/i)
  if (m) return m[1].toUpperCase()
  return null
}

// ── Fungsi: Normalize tower ID dari span ─────────────────────────────────────
// "T7 - T8" -> ["T7", "T8"]
// "TA4 - TA4A" -> ["TA4", "TA4A"]
// "JP3 - JP4" -> ["JP3", "JP4"]
function parseSpanTowerNums(span) {
  // Match alphanumeric tokens: T7, T8, TA4, TA4A, JP3, AH7, etc.
  const matches = span.match(/[A-Z]{0,2}\d+[A-Z]?/gi)
  return matches ? matches.map(t => t.toUpperCase()) : []
}

// ── Fungsi utama: cari koordinat untuk satu tower ────────────────────────────
function findCoordForSpan(ruas, span) {
  const codes = RUAS_TO_KML_CODE[ruas.trim()]
  if (!codes) {
    console.warn(`  ⚠ Tidak ada KML mapping untuk RUAS: "${ruas}"`)
    return null
  }

  // Filter points yang sesuai dengan line code
  const linePoints = allPoints.filter(pt => {
    const n = pt.name.toUpperCase()
    return codes.some(code => n.includes(code.toUpperCase()))
  })

  if (linePoints.length === 0) {
    console.warn(`  ⚠ Tidak ada geodata untuk codes: ${codes.join(', ')}`)
    return null
  }

  // Parse tower numbers dari span
  const tNums = parseSpanTowerNums(span)
  if (tNums.length === 0) {
    console.warn(`  ⚠ Tidak bisa parse nomor tower dari: "${span}"`)
    return null
  }

  // Cari points yang match dengan nomor tower
  const matched = []
  for (const tNum of tNums) {
    // Cari exact match dulu
    let found = linePoints.find(pt => {
      const num = extractTowerNum(pt.name)
      return num === tNum
    })
    
    // Fallback: cari yang mengandung nomor (tanpa prefix huruf)
    if (!found) {
      const numOnly = tNum.replace(/^[A-Z]+/i, '')
      found = linePoints.find(pt => {
        const n = pt.name.toUpperCase()
        // Match #T7 atau #7 atau #D7 dst (semua yang diakhiri angka yang sama)
        return n.match(new RegExp(`#[A-Z]*0*${numOnly}[A-Z]?(?:\\s|$)`, 'i'))
      })
    }

    if (found) matched.push(found)
  }

  if (matched.length === 0) {
    console.warn(`  ⚠ Tower ${tNums.join('+')} tidak ditemukan di line ${codes[0]}`)
    // Print beberapa sampel untuk debug
    const sample = linePoints.slice(0, 5).map(p => extractTowerNum(p.name)).join(', ')
    console.warn(`     Sample tower numbers di line: ${sample}`)
    return null
  }

  // Midpoint jika ada 2 tower
  const lat = matched.reduce((s, p) => s + p.lat, 0) / matched.length
  const lng = matched.reduce((s, p) => s + p.lng, 0) / matched.length
  return { lat, lng, matchedCount: matched.length }
}

// ── Main ─────────────────────────────────────────────────────────────────────
const client = new Client({ connectionString: 'postgresql://dhanu@localhost:5432/sitower_db' })

async function main() {
  await client.connect()
  console.log('✅ DB connected\n')

  // Ambil semua tower dengan lat=0
  const { rows: zeroTowers } = await client.query(
    `SELECT id, nama FROM "Tower" WHERE lat = 0 ORDER BY id`
  )
  console.log(`🔍 Tower dengan koordinat kosong (lat=0): ${zeroTowers.length}\n`)

  let updated = 0
  let skipped = 0

  for (const tower of zeroTowers) {
    // Nama format: "Tower/Span T25 - T26 (SUTT 150KV CENGKARENG BARU - ITS - TANGERANG BARU)"
    const ruasMatch = tower.nama.match(/\((.+?)\)$/)
    const ruas = ruasMatch?.[1]?.trim()
    const span = tower.id.trim()

    if (!ruas) {
      console.log(`  ⏭ SKIP ${span} - tidak bisa extract RUAS dari nama`)
      skipped++
      continue
    }

    process.stdout.write(`  🗼 ${span} (${ruas.slice(0, 45).padEnd(45)}) -> `)
    const result = findCoordForSpan(ruas, span)

    if (!result) {
      skipped++
      continue
    }

    await client.query(
      `UPDATE "Tower" SET lat = $1, lng = $2, "updatedAt" = NOW() WHERE id = $3`,
      [result.lat, result.lng, tower.id]
    )
    console.log(`✅ [${result.matchedCount} pts] lat=${result.lat.toFixed(5)}, lng=${result.lng.toFixed(5)}`)
    updated++
  }

  await client.end()

  console.log(`\n${'─'.repeat(60)}`)
  console.log(`📊 Hasil:`)
  console.log(`   ✅ Updated : ${updated}`)
  console.log(`   ⏭ Skipped : ${skipped}`)
}

main().catch(err => {
  console.error('❌ Error:', err.message)
  client.end().catch(() => {})
  process.exit(1)
})
