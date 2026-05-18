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

interface CurrentUser {
  id: string
  role: string
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
    search?: string
  }) {
    const page  = Math.max(1, Number(query.page  ?? 1))
    const limit = Math.min(500, Math.max(1, Number(query.limit ?? 100)))
    const skip  = (page - 1) * limit

    const where: any = {}
    if (query.route_id)      where.routeId         = Number(query.route_id)

    // Free-text search across id / nama / jalur / lokasi (case-insensitive).
    if (query.search && query.search.trim()) {
      const term = query.search.trim()
      where.OR = [
        { id:     { contains: term, mode: 'insensitive' } },
        { nama:   { contains: term, mode: 'insensitive' } },
        { jalur:  { contains: term, mode: 'insensitive' } },
        { lokasi: { contains: term, mode: 'insensitive' } },
      ]
    }
    
    // Status Kerawanan — computed dynamically from laporan (mirrors map overview logic).
    // A tower's effective status = worst levelRisiko across all its kerawanan laporan.
    if (query.status) {
      const KRITIS = ['kritis', 'kritis_terpenuhi', 'kritis_tidak_terpenuhi']
      const KERAWANAN_JENIS = [
        'pekerjaan_pihak_lain', 'kebakaran', 'layangan', 'pencurian', 'pemanfaatan_lahan',
      ]
      const requestedStatuses = query.status.split(',').map((s: string) => s.trim().toLowerCase())
      const statusConditions: any[] = []

      for (const s of requestedStatuses) {
        if (s === 'kritis') {
          // Any kritis-level laporan present
          statusConditions.push({
            laporan: { some: { levelRisiko: { in: KRITIS }, jenisGangguan: { in: KERAWANAN_JENIS } } },
          })
        } else if (s === 'sedang') {
          // Has a sedang laporan but no kritis laporan
          statusConditions.push({
            AND: [
              { laporan: { some: { levelRisiko: 'sedang', jenisGangguan: { in: KERAWANAN_JENIS } } } },
              { laporan: { none: { levelRisiko: { in: KRITIS }, jenisGangguan: { in: KERAWANAN_JENIS } } } },
            ],
          })
        } else if (s === 'aman') {
          // Has kerawanan laporan but worst level is aman (no sedang or kritis)
          statusConditions.push({
            AND: [
              { laporan: { some: { jenisGangguan: { in: KERAWANAN_JENIS } } } },
              { laporan: { none: { levelRisiko: { in: ['sedang', ...KRITIS] }, jenisGangguan: { in: KERAWANAN_JENIS } } } },
            ],
          })
        } else if (s === 'tidak ada aktivitas') {
          // No kerawanan laporan at all
          statusConditions.push({
            laporan: { none: { jenisGangguan: { in: KERAWANAN_JENIS } } },
          })
        }
      }

      if (statusConditions.length === 1) {
        Object.assign(where, statusConditions[0])
      } else if (statusConditions.length > 1) {
        where.OR = [...(where.OR ?? []), ...statusConditions]
      }
    }
    
    // Jenis Kerawanan (Support multi-select)
    if (query.kerawanan_type) {
      const types = query.kerawanan_type.split(',')
      where.jenisKerawanan = types.length > 1 ? { in: types } : types[0]
    }

    // Tipe (Support multi-select)
    if (query['tipe']) {
      const types = query['tipe'].split(',')
      where.tipe = types.length > 1 ? { in: types } : types[0]
    }

    // Certificate Status
    if (query['hasCertificate'] !== undefined) {
      where.hasCertificate = query['hasCertificate'] === 'true'
    }

    // CCTV Status
    if (query['hasCctv'] !== undefined) {
      where.hasCctv = query['hasCctv'] === 'true'
    }

    const [data, total] = await Promise.all([
      this.prisma.tower.findMany({
        where,
        include: { route: { include: { lineType: true } } },
        orderBy: [{ jalur: 'asc' }, { nomorUrut: 'asc' }, { id: 'asc' }],
        skip,
        take: limit,
      }),
      this.prisma.tower.count({ where }),
    ])

    return { data, total, page, limit }
  }

  // Unpaginated, unfiltered tower list shaped for the Ruas dropdown in the
  // Buat Laporan form. Must mirror the field shape expected by TowerOption on
  // the frontend (id, nomorTower, garduInduk, tipe, tegangan, nama, jalur,
  // lat, lng, radius). Returns ALL towers — newly-added ones included.
  async findAllTowersForDropdown() {
    const towers = await this.prisma.tower.findMany({
      select: {
        id: true, nama: true, tipe: true, tegangan: true,
        lat: true, lng: true, radius: true, jalur: true,
      },
      orderBy: [{ jalur: 'asc' }, { nomorUrut: 'asc' }, { id: 'asc' }],
    })
    return towers.map((t) => ({
      id: t.id,
      nomorTower: t.id,
      garduInduk: '',
      tipe: t.tipe,
      tegangan: t.tegangan,
      nama: t.nama,
      jalur: t.jalur ?? undefined,
      lat: t.lat,
      lng: t.lng,
      radius: t.radius,
    }))
  }

  async findOneTower(id: string, _currentUser?: CurrentUser) {
    const rec = await this.prisma.tower.findUnique({
      where: { id },
      include: {
        route:   { include: { lineType: true, garduDari: true, garduKe: true } },
        laporan: {
          orderBy: { tanggal: 'desc' },
          take: 10,
        },
        sertifikat: {
          include: { _count: { select: { dokumen: true } }, dokumen: { orderBy: { createdAt: 'desc' } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    })
    if (!rec) throw new NotFoundException(`Tower ${id} tidak ditemukan`)
    return rec
  }

  async createTower(dto: CreateTowerAsetDto, files?: Express.Multer.File[]) {
    const crypto = require('crypto')
    // Explicitly handle fields that come as strings from multipart/form-data
    const data: any = {
      id: crypto.randomUUID(), // Manual ID generation workaround
      ...dto,
      lat: dto.lat ? Number(dto.lat) : 0,
      lng: dto.lng ? Number(dto.lng) : 0,
      radius: dto.radius ? Number(dto.radius) : 100,
      nomorUrut: dto.nomorUrut ? Number(dto.nomorUrut) : null,
      routeId: dto.routeId ? Number(dto.routeId) : null,
      hasCertificate: String(dto.hasCertificate) === 'true',
      hasCctv: String(dto.hasCctv) === 'true',
      statusKerawanan: dto.statusKerawanan ?? 'aman',
    }

    const tower = await this.prisma.tower.create({
      data,
      include: {
        sertifikat: { include: { dokumen: true } },
        route: true,
      },
    })

    if (files && files.length > 0) {
      const cert = await this.prisma.sertifikat.create({
        data: {
          towerId: tower.id,
          nama: `Sertifikat Aset ${tower.nama}`,
          kategori: 'Aset',
          status: 'berlaku',
        },
      })
      const docs = files.map((f) => ({
        folderId: cert.id,
        namaFile: f.originalname,
        fileUrl: `/uploads/sertifikat/${f.filename}`,
      }))
      await this.prisma.sertifikatDokumen.createMany({ data: docs })
      
      // Refresh to include new docs
      return this.findOneTower(tower.id)
    }
    return tower
  }

  async updateTower(id: string, dto: UpdateTowerAsetDto, files?: Express.Multer.File[]) {
    await this.findOneTower(id)
    
    // Explicitly handle fields that come as strings from multipart/form-data
    const data: any = { ...dto }
    if (dto.lat !== undefined) data.lat = Number(dto.lat)
    if (dto.lng !== undefined) data.lng = Number(dto.lng)
    if (dto.radius !== undefined) data.radius = Number(dto.radius)
    if (dto.nomorUrut !== undefined) data.nomorUrut = dto.nomorUrut ? Number(dto.nomorUrut) : null
    if (dto.routeId !== undefined) data.routeId = dto.routeId ? Number(dto.routeId) : null
    if (dto.hasCertificate !== undefined) {
      data.hasCertificate = String(dto.hasCertificate) === 'true'
    }
    if (dto.hasCctv !== undefined) {
      data.hasCctv = String(dto.hasCctv) === 'true'
    }

    const tower = await this.prisma.tower.update({
      where: { id },
      data,
      include: {
        sertifikat: { include: { dokumen: true } },
        route: true,
      },
    })

    if (files && files.length > 0) {
      // Find or create a default certificate folder
      let cert = await this.prisma.sertifikat.findFirst({
        where: { towerId: id, kategori: 'Aset' },
      })
      if (!cert) {
        cert = await this.prisma.sertifikat.create({
          data: {
            towerId: id,
            nama: `Sertifikat Aset ${tower.nama}`,
            kategori: 'Aset',
            status: 'berlaku',
          },
        })
      }
      const docs = files.map((f) => ({
        folderId: cert.id,
        namaFile: f.originalname,
        fileUrl: `/uploads/sertifikat/${f.filename}`,
      }))
      await this.prisma.sertifikatDokumen.createMany({ data: docs })
      return this.findOneTower(id)
    }
    return tower
  }

  async removeTower(id: string) {
    await this.findOneTower(id)
    return this.prisma.$transaction(async (tx) => {
      // Delete related records that don't have cascade in schema
      await tx.laporan.deleteMany({ where: { towerId: id } })
      await tx.sertifikat.deleteMany({ where: { towerId: id } })
      await tx.asBuiltDrawing.deleteMany({ where: { towerId: id } })
      await tx.asBuiltFolder.deleteMany({ where: { towerId: id } })
      
      return tx.tower.delete({ where: { id } })
    })
  }

  // ── Map Overview ───────────────────────────────────────────────────────────
  async getMapOverview(_currentUser?: CurrentUser) {
    // Map overview is open to every authenticated user — teknisi sees the
    // same tower set as admin. Ownership only restricts writes.
    const towerWhere: any = {
      lat: { not: 0 },
      lng: { not: 0 },
    }

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
        where:   towerWhere,
        orderBy: [{ jalur: 'asc' }, { nomorUrut: 'asc' }],
        select:  {
          id: true, nama: true, lat: true, lng: true, updatedAt: true,
          tipe: true, hasCctv: true, hasCertificate: true,
          statusKerawanan: true, jenisKerawanan: true, routeId: true,
          laporan: {
            // Only ACTIVE laporan (berlangsung / tidak_ada_aktifitas) drive
            // the map marker color and popup kerawanan list. When all of a
            // tower's laporan are 'selesai', kerawanan[] becomes empty and
            // the marker falls back to the route's normal color. Keeps map
            // in sync with the dashboard stats card (which already excludes
            // 'selesai' for the PPL count).
            where: { status: { in: ['berlangsung', 'tidak_ada_aktifitas'] } },
            select: { id: true, jenisGangguan: true, levelRisiko: true, updatedAt: true },
          },
          sertifikat: { select: { id: true }, take: 1 },
        },
      }),
    ])

    const KERAWANAN_JENIS = new Set([
      'pekerjaan_pihak_lain', 'kebakaran', 'layangan', 'pencurian', 'pemanfaatan_lahan',
    ])

    // Priority used to pick the "most critical" status across multiple laporan.
    // Same ranking used by LaporanService.syncTowerStatus.
    const LEVEL_PRIORITY: Record<string, number> = {
      kritis_tidak_terpenuhi: 4,
      kritis_terpenuhi:       3,
      kritis:                 3,
      sedang:                 2,
      aman:                   1,
    }
    const worseLevel = (a: string, b: string) =>
      (LEVEL_PRIORITY[b] ?? 0) > (LEVEL_PRIORITY[a] ?? 0) ? b : a

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
      towers: towerRecords.map((t) => {
        // Return one entry per ACTIVE laporan (no jenis dedup) so the popup
        // shows every kerawanan separately — including towers with multiple
        // active laporan of the same jenis. Ordering: worst-level first,
        // then most-recently-updated.
        const kerawanan = t.laporan
          .filter((l) => KERAWANAN_JENIS.has(l.jenisGangguan))
          .map((l) => ({
            jenis: l.jenisGangguan,
            level: l.levelRisiko,
            laporan_id: l.id,
            updatedAt: l.updatedAt,
          }))
          .sort((a, b) => {
            const pa = LEVEL_PRIORITY[a.level] ?? 0
            const pb = LEVEL_PRIORITY[b.level] ?? 0
            if (pa !== pb) return pb - pa
            return b.updatedAt.getTime() - a.updatedAt.getTime()
          })
          .map(({ updatedAt: _u, ...rest }) => rest)
        // Overall tower status = worst level across all per-jenis entries.
        // Falls back to the stored statusKerawanan if the tower has no active
        // laporan (e.g. seeded data without reports).
        const overallStatus = kerawanan.length
          ? kerawanan.reduce((acc, k) => worseLevel(acc, k.level), 'aman')
          : t.statusKerawanan

        return {
          id:             t.id,
          tower_code:     t.id,
          name:           t.nama,
          lat:            t.lat,
          lng:            t.lng,
          tipe:           t.tipe,
          bersertifikat:  t.hasCertificate ?? false,
          hasCctv:        t.hasCctv ?? false,
          status:         overallStatus,
          kerawanan_type: t.jenisKerawanan,
          kerawanan_types: kerawanan.map((k) => k.jenis),
          kerawanan,
          icon_color:     ICON_COLOR[overallStatus] ?? '#00CC00',
          route_id:       t.routeId,
          // Latest of: tower's own updatedAt (sertifikat/CCTV/info edit) +
          // all laporan updatedAt (new report or progres update). Whichever
          // is newest wins, so popup "Terakhir update" reflects any change.
          updated_at:     t.laporan.reduce(
            (latest, l) => l.updatedAt > latest ? l.updatedAt : latest,
            t.updatedAt,
          ),
        }
      }),
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

  async getMapFilter(type: string, _currentUser?: CurrentUser) {
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
  async getStats(_currentUser?: CurrentUser) {
    // Tower stats are visible to every authenticated user. Ownership only
    // restricts write actions, not dashboard visibility.
    const where: any = {}
    const [total, byStatus, byJenis] = await Promise.all([
      this.prisma.tower.count({ where }),
      this.prisma.tower.groupBy({ where, by: ['statusKerawanan'], _count: true }),
      this.prisma.tower.groupBy({ where, by: ['jenisKerawanan'],  _count: true }),
    ])

    const statusMap = Object.fromEntries(byStatus.map((r) => [r.statusKerawanan, r._count]))
    const jenisMap  = Object.fromEntries(
      byJenis.filter((r) => r.jenisKerawanan).map((r) => [r.jenisKerawanan!, r._count]),
    )

    return {
      total,
      aman:                   statusMap['aman']                   ?? 0,
      sedang:                 statusMap['sedang']                 ?? 0,
      kritis_terpenuhi:       statusMap['kritis_terpenuhi']       ?? 0,
      kritis_tidak_terpenuhi: statusMap['kritis_tidak_terpenuhi'] ?? 0,
      kritis:                 statusMap['kritis']                 ?? 0, // legacy
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

  // ── Certificates ───────────────────────────────────────────────────────────
  async findCertificatesByTower(towerId: string) {
    return this.prisma.sertifikat.findMany({
      where: { towerId },
      include: {
        _count: { select: { dokumen: true } },
        dokumen: { orderBy: { createdAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findCertificate(id: string) {
    const cert = await this.prisma.sertifikat.findUnique({
      where: { id },
      include: {
        tower: { select: { id: true, nama: true } },
        dokumen: { orderBy: { createdAt: 'desc' } },
      },
    })
    if (!cert) throw new NotFoundException(`Sertifikat ${id} tidak ditemukan`)
    return cert
  }

  async createCertificate(towerId: string, data: any, files?: Express.Multer.File[]) {
    const cert = await this.prisma.sertifikat.create({
      data: {
        towerId,
        nama: data.nama,
        kategori: data.kategori,
        status: data.status || 'berlaku',
        berlakuHingga: data.berlakuHingga ? new Date(data.berlakuHingga) : null,
      },
    })

    if (files && files.length > 0) {
      const docs = files.map((f) => ({
        folderId: cert.id,
        namaFile: f.originalname,
        fileUrl: `/uploads/sertifikat/${f.filename}`,
      }))
      await this.prisma.sertifikatDokumen.createMany({ data: docs })
    }

    return this.findCertificate(cert.id)
  }

  async updateCertificate(id: string, data: any, files?: Express.Multer.File[]) {
    await this.findCertificate(id)
    const cert = await this.prisma.sertifikat.update({
      where: { id },
      data: {
        ...(data.nama && { nama: data.nama }),
        ...(data.kategori && { kategori: data.kategori }),
        ...(data.status && { status: data.status }),
        ...(data.berlakuHingga && { berlakuHingga: new Date(data.berlakuHingga) }),
      },
    })

    if (files && files.length > 0) {
      const docs = files.map((f) => ({
        folderId: cert.id,
        namaFile: f.originalname,
        fileUrl: `/uploads/sertifikat/${f.filename}`,
      }))
      await this.prisma.sertifikatDokumen.createMany({ data: docs })
    }

    return this.findCertificate(id)
  }

  async removeCertificate(id: string) {
    await this.findCertificate(id)
    return this.prisma.sertifikat.delete({ where: { id } })
  }

  // ── Documents ──────────────────────────────────────────────────────────────
  async findDocument(id: string) {
    const doc = await this.prisma.sertifikatDokumen.findUnique({
      where: { id },
      include: { folder: { select: { id: true, nama: true } } },
    })
    if (!doc) throw new NotFoundException(`Dokumen ${id} tidak ditemukan`)
    return doc
  }

  async removeDocument(id: string) {
    await this.findDocument(id)
    return this.prisma.sertifikatDokumen.delete({ where: { id } })
  }
}
