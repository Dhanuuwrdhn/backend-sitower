import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateGarduIndukDto } from './dto/create-gardu-induk.dto'
import { UpdateGarduIndukDto } from './dto/update-gardu-induk.dto'
import { CreateRouteDto } from './dto/create-route.dto'
import { UpdateRouteDto } from './dto/update-route.dto'
import { CreateTowerAsetDto } from './dto/create-tower-aset.dto'
import { UpdateTowerAsetDto } from './dto/update-tower-aset.dto'
import * as XLSX from 'xlsx'
import * as path from 'path'

const ROUTE_PREFIX: Record<string, string> = {
  'SUTT KEMBANGAN - PETUKANGAN':                                  'KBG-PTK',
  'SUTT KEMBANGAN - DURIKOSAMBI':                                 'KBG-DKS',
  'SUTT GANDUL - KEMBANGAN':                                      'GND-KBG',
  'SUTT GANDUL - KEMBANGAN + DURIKOSAMBI':                        'GND-KBG-D',
  'SUTT DURIKOSAMBI - CENGKARENG':                                'DKS-CKG',
  'SUTT DURIKOSAMBI - TANGERANG LAMA + DURIKOSAMBI - CENGKARENG': 'DKS-TNGL',
  'SUTT TANGERANG - CENGKARENG':                                  'TNG-CKG',
  'SUTT CENGKARENG BARU - TANGERANG BARU':                        'CKGB-TNGB',
}

const ICON_COLOR: Record<string, string> = {
  kritis_tidak_terpenuhi: '#FF0000',
  kritis_terpenuhi:       '#FF0000',
  kritis:                 '#FF0000', // legacy
  sedang:                 '#FFA500',
  aman:                   '#00CC00',
}

function normalizeRoute(raw: string): string {
  return raw
    .replace('SUTTTANGERANG', 'SUTT TANGERANG')
    .replace(/TANGERANG-\s/, 'TANGERANG - ')
    .replace(/DURIKOSAMBI-TANGERANG LAMA/, 'DURIKOSAMBI - TANGERANG LAMA')
    .replace(/\s*\+\s*/g, ' + ')
    .trim()
}

function parseDesc(desc: string) {
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

function mapExcelStatus(excelStatus: string, color: string) {
  const s = (excelStatus || 'AMAN').toUpperCase().trim()
  const c = (color || 'Lime').toLowerCase()
  if (s === 'PPL')           return { statusKerawanan: c === 'red' ? 'kritis' : 'sedang', jenisKerawanan: 'ppl' as string | null }
  if (s.startsWith('LAYANG')) return { statusKerawanan: 'sedang', jenisKerawanan: 'layangan' as string | null }
  return { statusKerawanan: 'aman', jenisKerawanan: null as string | null }
}

@Injectable()
export class AsetService {
  constructor(private prisma: PrismaService) {}

  // ── Line Types ─────────────────────────────────────────────────────────────
  findAllLineTypes() {
    return this.prisma.transmissionLineType.findMany({ orderBy: { kode: 'asc' } })
  }

  // ── Gardu Induk ────────────────────────────────────────────────────────────
  findAllGardu() {
    return this.prisma.garduInduk.findMany({ orderBy: { nama: 'asc' } })
  }

  async findOneGardu(id: number) {
    const rec = await this.prisma.garduInduk.findUnique({
      where: { id },
      include: {
        routesDari: { include: { lineType: true, garduKe: true } },
        routesKe:   { include: { lineType: true, garduDari: true } },
      },
    })
    if (!rec) throw new NotFoundException(`GarduInduk ${id} tidak ditemukan`)
    return rec
  }

  async createGardu(dto: CreateGarduIndukDto) {
    return this.prisma.garduInduk.create({ data: dto })
  }

  async updateGardu(id: number, dto: UpdateGarduIndukDto) {
    await this.findOneGardu(id)
    return this.prisma.garduInduk.update({ where: { id }, data: dto })
  }

  // ── Routes ─────────────────────────────────────────────────────────────────
  findAllRoutes() {
    return this.prisma.transmissionRoute.findMany({
      include: { lineType: true, garduDari: true, garduKe: true },
      orderBy: { nama: 'asc' },
    })
  }

  async findOneRoute(id: number) {
    const rec = await this.prisma.transmissionRoute.findUnique({
      where: { id },
      include: {
        lineType:  true,
        garduDari: true,
        garduKe:   true,
        towers:    { orderBy: { nomorUrut: 'asc' }, select: { id: true, nama: true, lat: true, lng: true, statusKerawanan: true, jenisKerawanan: true, nomorUrut: true } },
      },
    })
    if (!rec) throw new NotFoundException(`Route ${id} tidak ditemukan`)
    return rec
  }

  async createRoute(dto: CreateRouteDto) {
    return this.prisma.transmissionRoute.create({
      data: dto,
      include: { lineType: true, garduDari: true, garduKe: true },
    })
  }

  async updateRoute(id: number, dto: UpdateRouteDto) {
    await this.findOneRoute(id)
    return this.prisma.transmissionRoute.update({
      where: { id },
      data: dto,
      include: { lineType: true, garduDari: true, garduKe: true },
    })
  }

  // ── Towers ─────────────────────────────────────────────────────────────────
  async findAllTowers(query: {
    route_id?: string
    status?: string
    kerawanan_type?: string
    bbox?: string
    page?: string
    limit?: string
  }) {
    const page  = Math.max(1, Number(query.page  ?? 1))
    const limit = Math.min(500, Math.max(1, Number(query.limit ?? 100)))
    const skip  = (page - 1) * limit

    const where: any = {}
    if (query.route_id)      where.routeId         = Number(query.route_id)
    if (query.status)        where.statusKerawanan  = query.status
    if (query.kerawanan_type) where.jenisKerawanan  = query.kerawanan_type

    if (query.bbox) {
      // bbox=minLat,minLng,maxLat,maxLng
      const [minLat, minLng, maxLat, maxLng] = query.bbox.split(',').map(Number)
      if ([minLat, minLng, maxLat, maxLng].some(isNaN)) throw new BadRequestException('bbox tidak valid')
      where.lat = { gte: minLat, lte: maxLat }
      where.lng = { gte: minLng, lte: maxLng }
    }

    const [data, total] = await Promise.all([
      this.prisma.tower.findMany({
        where,
        include: { route: { include: { lineType: true } } },
        orderBy: [{ jalur: 'asc' }, { nomorUrut: 'asc' }],
        skip,
        take: limit,
      }),
      this.prisma.tower.count({ where }),
    ])

    return { data, total, page, limit }
  }

  async findOneTower(id: string) {
    const rec = await this.prisma.tower.findUnique({
      where: { id },
      include: {
        route:   { include: { lineType: true, garduDari: true, garduKe: true } },
        laporan: { orderBy: { tanggal: 'desc' }, take: 10 },
      },
    })
    if (!rec) throw new NotFoundException(`Tower ${id} tidak ditemukan`)
    return rec
  }

  async createTower(dto: CreateTowerAsetDto) {
    return this.prisma.tower.create({
      data: {
        ...dto,
        tegangan: '150kV',
        tipe:     'SUTT',
        kondisi:  'normal',
        statusKerawanan: dto.statusKerawanan ?? 'aman',
      },
    })
  }

  async updateTower(id: string, dto: UpdateTowerAsetDto) {
    await this.findOneTower(id)
    return this.prisma.tower.update({ where: { id }, data: dto })
  }

  async removeTower(id: string) {
    await this.findOneTower(id)
    return this.prisma.tower.delete({ where: { id } })
  }

  // ── Map Overview ───────────────────────────────────────────────────────────
  async getMapOverview() {
    const [routeRecords, garduRecords, towerRecords] = await Promise.all([
      this.prisma.transmissionRoute.findMany({
        include: {
          lineType: true,
          garduDari: true,
          garduKe:   true,
          towers: {
            where:   { lat: { not: 0 }, lng: { not: 0 } },
            orderBy: { nomorUrut: 'asc' },
            select:  { lat: true, lng: true },
          },
        },
        orderBy: { nama: 'asc' },
      }),
      this.prisma.garduInduk.findMany({ orderBy: { nama: 'asc' } }),
      this.prisma.tower.findMany({
        where:   { lat: { not: 0 }, lng: { not: 0 } },
        orderBy: [{ jalur: 'asc' }, { nomorUrut: 'asc' }],
        select:  {
          id: true, nama: true, lat: true, lng: true,
          statusKerawanan: true, jenisKerawanan: true, routeId: true,
          laporan: {
            where:  { status: 'berlangsung' },
            select: { jenisGangguan: true, levelRisiko: true },
          },
        },
      }),
    ])

    const KERAWANAN_JENIS = new Set([
      'pekerjaan_pihak_lain', 'kebakaran', 'layangan', 'pencurian', 'pemanfaatan_lahan',
    ])

    return {
      routes: routeRecords.map((r) => ({
        id:           r.id,
        name:         r.nama,
        line_type:    r.lineType.kode,
        voltage_kv:   parseInt(r.lineType.tegangan),
        line_color:   r.lineType.warna,
        line_style:   r.lineType.lineStyle,
        gardu_dari:   r.garduDari.nama,
        gardu_ke:     r.garduKe.nama,
        polyline:     r.towers.map((t) => ({ lat: t.lat, lng: t.lng })),
      })),
      gardu_induk: garduRecords.map((g) => ({
        id:   g.id,
        name: g.nama,
        kode: g.kode,
        lat:  g.lat,
        lng:  g.lng,
        icon: 'gardu',
      })),
      towers: towerRecords.map((t) => ({
        id:             t.id,
        tower_code:     t.id,
        name:           t.nama,
        lat:            t.lat,
        lng:            t.lng,
        status:         t.statusKerawanan,
        kerawanan_type: t.jenisKerawanan,
        kerawanan_types: [...new Set(
          t.laporan
            .filter((l) => KERAWANAN_JENIS.has(l.jenisGangguan))
            .map((l) => l.jenisGangguan)
        )],
        icon_color:     ICON_COLOR[t.statusKerawanan] ?? '#00CC00',
        route_id:       t.routeId,
      })),
    }
  }

  async getMapRoutes() {
    const routes = await this.prisma.transmissionRoute.findMany({
      include: {
        lineType: true,
        towers: {
          where:   { lat: { not: 0 }, lng: { not: 0 } },
          orderBy: { nomorUrut: 'asc' },
          select:  { lat: true, lng: true },
        },
      },
      orderBy: { nama: 'asc' },
    })

    return routes.map((r) => ({
      id:        r.id,
      name:      r.nama,
      line_type: r.lineType.kode,
      line_color: r.lineType.warna,
      line_style: r.lineType.lineStyle,
      polyline:  r.towers.map((t) => ({ lat: t.lat, lng: t.lng })),
    }))
  }

  async getMapFilter(type: string) {
    const towers = await this.prisma.tower.findMany({
      where: {
        lat: { not: 0 },
        lng: { not: 0 },
        ...(type === 'semua' ? {} : type === 'kritis' || type === 'sedang' || type === 'aman'
          ? { statusKerawanan: type }
          : { jenisKerawanan: type }),
      },
      orderBy: [{ jalur: 'asc' }, { nomorUrut: 'asc' }],
      select: { id: true, nama: true, lat: true, lng: true, statusKerawanan: true, jenisKerawanan: true, pplNotes: true },
    })

    return towers.map((t) => ({
      id:             t.id,
      tower_code:     t.id,
      name:           t.nama,
      lat:            t.lat,
      lng:            t.lng,
      status:         t.statusKerawanan,
      kerawanan_type: t.jenisKerawanan,
      ppl_notes:      t.pplNotes,
      icon_color:     ICON_COLOR[t.statusKerawanan] ?? '#00CC00',
    }))
  }

  // ── Stats ──────────────────────────────────────────────────────────────────
  async getStats() {
    const [total, byStatus, byJenis] = await Promise.all([
      this.prisma.tower.count(),
      this.prisma.tower.groupBy({ by: ['statusKerawanan'], _count: true }),
      this.prisma.tower.groupBy({ by: ['jenisKerawanan'],  _count: true }),
    ])

    const statusMap = Object.fromEntries(byStatus.map((r) => [r.statusKerawanan, r._count]))
    const jenisMap  = Object.fromEntries(
      byJenis.filter((r) => r.jenisKerawanan).map((r) => [r.jenisKerawanan!, r._count]),
    )

    return {
      total,
      aman:              statusMap['aman']   ?? 0,
      sedang:            statusMap['sedang'] ?? 0,
      kritis:            statusMap['kritis'] ?? 0,
      ppl:               jenisMap['ppl']                ?? 0,
      layangan:          jenisMap['layangan']           ?? 0,
      kebakaran:         jenisMap['kebakaran']          ?? 0,
      pencurian:         jenisMap['pencurian']          ?? 0,
      pemanfaatan_lahan: jenisMap['pemanfaatan_lahan']  ?? 0,
    }
  }

  // ── Import Excel ───────────────────────────────────────────────────────────
  async importFromExcel(buffer: Buffer) {
    const wb   = XLSX.read(buffer, { type: 'buffer' })
    const ws   = wb.Sheets[wb.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 }) as any[][]

    // Auto-detect header row: find row with 'Latitude' or 'lat' in first cell
    let dataStart = 1
    for (let i = 0; i < Math.min(rows.length, 10); i++) {
      const cell = String(rows[i]?.[0] || '').toLowerCase()
      if (cell === 'latitude' || cell === 'lat') { dataStart = i + 1; break }
    }

    const routeMap: Record<string, number | undefined> = {}
    const allRoutes = await this.prisma.transmissionRoute.findMany({ select: { id: true, nama: true } })
    allRoutes.forEach((r) => { routeMap[r.nama] = r.id })

    let created = 0
    let updated = 0

    const routeOrderMap: Record<string, number> = {}
    for (let i = dataStart; i < rows.length; i++) {
      const row = rows[i]
      if (!row[0] && !row[2]) continue
      const lat       = parseFloat(String(row[0]).trim())
      const lng       = parseFloat(String(row[1]).trim())
      const towerCode = String(row[2] || '').trim()
      const desc      = String(row[3] || '')
      const excelSt   = String(row[4] || 'AMAN')
      const color     = String(row[5] || 'Lime')

      if (!towerCode || isNaN(lat) || isNaN(lng)) continue

      const line1     = desc.split('\n')[0].trim()
      const routeMatch = line1.match(/^(.*?)\s+TOWER/i)
      const routeName  = routeMatch ? normalizeRoute(routeMatch[1].trim()) : ''
      const routeId    = routeMap[routeName] ?? null
      routeOrderMap[routeName] = (routeOrderMap[routeName] || 0) + 1

      const prefix   = ROUTE_PREFIX[routeName]
      const towerId  = prefix ? `${prefix}-${towerCode}` : towerCode

      const parsed = parseDesc(desc)
      const status = mapExcelStatus(excelSt, color)

      const existing = await this.prisma.tower.findUnique({ where: { id: towerId } })
      if (existing) {
        await this.prisma.tower.update({
          where: { id: towerId },
          data: { nama: line1, lat, lng, jalur: routeName, nomorUrut: routeOrderMap[routeName], routeId, ...status, ...parsed },
        })
        updated++
      } else {
        await this.prisma.tower.create({
          data: {
            id: towerId, nama: line1, lat, lng,
            tegangan: '150kV', tipe: 'SUTT', kondisi: 'normal',
            jalur: routeName, nomorUrut: routeOrderMap[routeName], routeId,
            ...status, ...parsed,
          },
        })
        created++
      }
    }

    return { message: `Import selesai: ${created} dibuat, ${updated} diperbarui` }
  }
}
