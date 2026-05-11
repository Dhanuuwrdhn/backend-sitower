import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as bcrypt from 'bcrypt'
import * as XLSX from 'xlsx'
import * as path from 'path'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma  = new PrismaClient({ adapter } as any)

const GARDU_DATA = [
  { kode: 'KBG',  nama: 'GI Kembangan',       lat: -6.1880, lng: 106.7200, tegangan: '150kV' },
  { kode: 'PTK',  nama: 'GI Petukangan',       lat: -6.2620, lng: 106.7430, tegangan: '150kV' },
  { kode: 'GND',  nama: 'GI Gandul',           lat: -6.3530, lng: 106.7930, tegangan: '150kV' },
  { kode: 'DKS',  nama: 'GI Durikosambi',      lat: -6.1710, lng: 106.7260, tegangan: '150kV' },
  { kode: 'CKG',  nama: 'GI Cengkareng',       lat: -6.1510, lng: 106.6590, tegangan: '150kV' },
  { kode: 'CKGB', nama: 'GI Cengkareng Baru',  lat: -6.1515, lng: 106.6585, tegangan: '150kV' },
  { kode: 'TNGB', nama: 'GI Tangerang Baru',   lat: -6.1570, lng: 106.6000, tegangan: '150kV' },
  { kode: 'TNGL', nama: 'GI Tangerang Lama',   lat: -6.2120, lng: 106.6340, tegangan: '150kV' },
]

const ROUTE_DEFS = [
  { nama: 'SUTT KEMBANGAN - PETUKANGAN',                                  dari: 'KBG',  ke: 'PTK'  },
  { nama: 'SUTT KEMBANGAN - DURIKOSAMBI',                                 dari: 'KBG',  ke: 'DKS'  },
  { nama: 'SUTT GANDUL - KEMBANGAN',                                      dari: 'GND',  ke: 'KBG'  },
  { nama: 'SUTT GANDUL - KEMBANGAN + DURIKOSAMBI',                        dari: 'GND',  ke: 'KBG'  },
  { nama: 'SUTT DURIKOSAMBI - CENGKARENG',                                dari: 'DKS',  ke: 'CKG'  },
  { nama: 'SUTT DURIKOSAMBI - TANGERANG LAMA + DURIKOSAMBI - CENGKARENG', dari: 'DKS',  ke: 'CKGB' },
  { nama: 'SUTT TANGERANG - CENGKARENG',                                  dari: 'TNGL', ke: 'CKG'  },
  { nama: 'SUTT CENGKARENG BARU - TANGERANG BARU',                        dari: 'CKGB', ke: 'TNGB' },
]

function normalizeRoute(raw: string): string {
  return raw
    .replace('SUTTTANGERANG', 'SUTT TANGERANG')
    .replace(/TANGERANG-\s/, 'TANGERANG - ')
    .replace(/DURIKOSAMBI-TANGERANG LAMA/, 'DURIKOSAMBI - TANGERANG LAMA')
    .replace(/\s*\+\s*/g, ' + ')
    .trim()
}

function parseDescription(desc: string) {
  const lines = desc.split('\n').map((l) => l.trim()).filter(Boolean)
  let pplNotes: string | null = null
  let penanggungJawab: string | null = null
  let telepon: string | null = null
  let sertifikatLink: string | null = null

  for (const line of lines) {
    if (line.startsWith('https://drive.google.com')) {
      sertifikatLink = line
    } else if (/^Penanggung Jawab\s*:/i.test(line)) {
      const val = line.replace(/^Penanggung Jawab\s*:\s*/i, '').trim()
      // match trailing (phone) — handles "(0811103317)" and "((021) 58356234)"
      const m = val.match(/\((\(?\d[\d\s\-\(\)]+)\)\s*$/)
      if (m) {
        penanggungJawab = val.replace(m[0], '').trim()
        telepon = m[1].replace(/[()]/g, '').trim()
      } else {
        penanggungJawab = val
      }
    } else if (line.startsWith('- ') && !line.includes('drive.google.com')) {
      const note = line.substring(2).trim()
      pplNotes = pplNotes ? `${pplNotes}; ${note}` : note
    }
  }

  return { pplNotes, penanggungJawab, telepon, sertifikatLink }
}

function mapStatus(excelStatus: string, color: string) {
  const s = (excelStatus || 'AMAN').toUpperCase().trim()
  const c = (color || 'Lime').toLowerCase()
  if (s === 'PPL') {
    return { statusKerawanan: c === 'red' ? 'kritis' : 'sedang', jenisKerawanan: 'ppl' }
  }
  if (s.startsWith('LAYANG')) {
    return { statusKerawanan: 'sedang', jenisKerawanan: 'layangan' }
  }
  return { statusKerawanan: 'aman', jenisKerawanan: null as string | null }
}

async function main() {
  // Pegawai
  const adminPass   = await bcrypt.hash('admin123', 10)
  const teknisiPass = await bcrypt.hash('teknisi123', 10)
  for (const p of [
    { nik: '1234567890123456', nama: 'Budi Santoso', jabatan: 'Supervisor Transmisi', unit: 'UP3 Banten',    role: 'admin',   password: adminPass,   aktif: true },
    { nik: '9876543210987654', nama: 'Siti Rahayu',  jabatan: 'Teknisi Senior',       unit: 'UP3 Tangerang', role: 'teknisi', password: teknisiPass, aktif: true },
    { nik: '1122334455667788', nama: 'Ahmad Fauzi',  jabatan: 'Teknisi Lapangan',     unit: 'UIW Banten',    role: 'teknisi', password: teknisiPass, aktif: true },
  ]) {
    await prisma.pegawai.upsert({ where: { nik: p.nik }, update: p, create: p })
  }

  // TransmissionLineType
  const lineTypes = await Promise.all([
    prisma.transmissionLineType.upsert({ where: { kode: 'SUTT'  }, update: {}, create: { kode: 'SUTT',  tegangan: '150kV', warna: '#0000FF', lineStyle: 'solid'  } }),
    prisma.transmissionLineType.upsert({ where: { kode: 'SUTET' }, update: {}, create: { kode: 'SUTET', tegangan: '500kV', warna: '#FF0000', lineStyle: 'solid'  } }),
    prisma.transmissionLineType.upsert({ where: { kode: 'SKTT'  }, update: {}, create: { kode: 'SKTT',  tegangan: '150kV', warna: '#800080', lineStyle: 'dashed' } }),
  ])
  const suttId = lineTypes[0].id

  // GarduInduk
  const garduMap: Record<string, number> = {}
  for (const g of GARDU_DATA) {
    const rec = await prisma.garduInduk.upsert({
      where:  { kode: g.kode },
      update: { nama: g.nama, lat: g.lat, lng: g.lng, tegangan: g.tegangan },
      create: g,
    })
    garduMap[g.kode] = rec.id
  }

  // TransmissionRoute
  const routeMap: Record<string, number> = {}
  for (const r of ROUTE_DEFS) {
    const existing = await prisma.transmissionRoute.findFirst({ where: { nama: r.nama } })
    const rec = existing ?? await prisma.transmissionRoute.create({
      data: { nama: r.nama, lineTypeId: suttId, garduDariId: garduMap[r.dari], garduKeId: garduMap[r.ke] },
    })
    routeMap[r.nama] = rec.id
  }

  // Towers from Excel
  const excelPath = path.join(__dirname, 'data', 'EXCELL SENSITIF PLN ULTG DKSBI.xls')
  const wb   = XLSX.readFile(excelPath)
  const ws   = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 }) as any[][]
  const routeOrderMap: Record<string, number> = {}

  for (let i = 6; i < rows.length; i++) {
    const row       = rows[i]
    if (!row[0] && !row[2]) continue
    const lat       = parseFloat(String(row[0]).trim())
    const lng       = parseFloat(String(row[1]).trim())
    const towerCode = String(row[2] || '').trim()
    const desc      = String(row[3] || '')
    const excelSt   = String(row[4] || 'AMAN')
    const color     = String(row[5] || 'Lime')
    if (!towerCode || !lat) continue

    const line1      = desc.split('\n')[0].trim()
    const routeMatch = line1.match(/^(.*?)\s+TOWER/i)
    const routeName  = routeMatch ? normalizeRoute(routeMatch[1].trim()) : ''
    const routeId    = routeMap[routeName] ?? null

    routeOrderMap[routeName] = (routeOrderMap[routeName] || 0) + 1
    const nomorUrut  = routeOrderMap[routeName]

    const parsed  = parseDescription(desc)
    const status  = mapStatus(excelSt, color)

    await prisma.tower.upsert({
      where:  { id: towerCode },
      update: { nama: line1, lat, lng, tegangan: '150kV', tipe: 'SUTT', kondisi: 'normal', jalur: routeName, nomorUrut, routeId, ...status, ...parsed },
      create: { id: towerCode, nama: line1, lat, lng, tegangan: '150kV', tipe: 'SUTT', kondisi: 'normal', jalur: routeName, nomorUrut, routeId, ...status, ...parsed },
    })
  }

  const towerCount = await prisma.tower.count()
  console.log(`✓ Seed selesai: ${towerCount} tower, ${Object.keys(routeMap).length} jalur, ${GARDU_DATA.length} gardu induk`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
