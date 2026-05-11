import { Injectable, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

interface CoordPoint {
  lat: number
  lng: number
}

interface ParsedPoint {
  nama: string
  lat: number
  lng: number
  tipe: string
  tegangan: string
  jalur: string | null
}

interface ParsedJalur {
  nama: string
  tipe: string
  warna: string | null
  path: CoordPoint[]
}

@Injectable()
export class JalurKmlService {
  constructor(private prisma: PrismaService) {}

  private parseName(raw: string): string {
    return raw.trim().replace(/<!\[CDATA\[([\s\S]*?)\]\]>/, '$1').trim()
  }

  private detectTowerType(nama: string): { tipe: string; tegangan: string } {
    const upper = nama.toUpperCase()
    if (upper.includes('GI ') || upper.includes('GIS ') || upper.includes('GISTET') || upper.startsWith('GI') || upper.includes('GARDU')) {
      return { tipe: 'garduInduk', tegangan: '150 kV' }
    }
    if (upper.includes('SUTET') || upper.includes('500KV') || upper.includes('500 KV')) {
      return { tipe: 'SUTET', tegangan: '500 kV' }
    }
    if (upper.includes('SKTT')) {
      return { tipe: 'SKTT', tegangan: '150 kV' }
    }
    if (upper.includes('SUTT') || upper.includes('150KV') || upper.includes('150 KV')) {
      return { tipe: 'SUTT', tegangan: '150 kV' }
    }
    return { tipe: 'SUTT', tegangan: '150 kV' }
  }

  private generateTowerId(nama: string, tipe: string): string {
    const slug = nama
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '-')
      .substring(0, 20)
      .replace(/^-|-$/g, '')
    const prefix = tipe === 'garduInduk' ? 'GI' : tipe === 'SUTET' ? 'ST' : tipe === 'SKTT' ? 'SK' : 'TW'
    return `${prefix}-${slug}`
  }

  private parsePoints(content: string): ParsedPoint[] {
    const results: ParsedPoint[] = []

    // Split by Folder to capture folder name (jalur) per group of Placemarks
    const folderRegex = /<Folder[\s\S]*?<\/Folder>/gi
    const folders = content.match(folderRegex) ?? []

    // Also parse Placemarks outside folders (no jalur context)
    const allFolderContent = folders.join('')
    const sources: Array<{ content: string; jalur: string | null }> = [
      ...folders.map((f) => {
        const nameMatch = f.match(/<name>\s*([\s\S]*?)\s*<\/name>/i)
        const folderName = nameMatch ? this.parseName(nameMatch[1]) : null
        return { content: f, jalur: folderName }
      }),
      { content: content.replace(allFolderContent, ''), jalur: null },
    ]

    for (const source of sources) {
      const placemarkRegex = /<Placemark[\s\S]*?<\/Placemark>/gi
      const placemarks = source.content.match(placemarkRegex) ?? []

      for (const placemark of placemarks) {
        if (!/<Point/i.test(placemark)) continue

        const nameMatch = placemark.match(/<name>\s*([\s\S]*?)\s*<\/name>/i)
        if (!nameMatch) continue
        const nama = this.parseName(nameMatch[1])

        const coordMatch = placemark.match(/<coordinates>\s*([\s\S]*?)\s*<\/coordinates>/i)
        if (!coordMatch) continue

        const parts = coordMatch[1].trim().split(',')
        if (parts.length < 2) continue
        const lng = parseFloat(parts[0])
        const lat = parseFloat(parts[1])
        if (isNaN(lat) || isNaN(lng)) continue

        const { tipe, tegangan } = this.detectTowerType(nama)
        results.push({ nama, lat, lng, tipe, tegangan, jalur: source.jalur })
      }
    }

    return results
  }

  private parseJalur(content: string): ParsedJalur[] {
    const results: ParsedJalur[] = []
    const placemarkRegex = /<Placemark[\s\S]*?<\/Placemark>/gi
    const placemarks = content.match(placemarkRegex) ?? []

    for (const placemark of placemarks) {
      if (!/<LineString/i.test(placemark)) continue

      const nameMatch = placemark.match(/<name>\s*([\s\S]*?)\s*<\/name>/i)
      const nama = nameMatch ? this.parseName(nameMatch[1]) : 'Jalur KML'

      const coordMatch = placemark.match(/<coordinates>\s*([\s\S]*?)\s*<\/coordinates>/i)
      if (!coordMatch) continue

      const path: CoordPoint[] = []
      const coordEntries = coordMatch[1].trim().split(/[\s\n\r]+/).filter((s) => s.trim().length > 0)
      for (const entry of coordEntries) {
        const parts = entry.trim().split(',')
        if (parts.length < 2) continue
        const lng = parseFloat(parts[0])
        const lat = parseFloat(parts[1])
        if (isNaN(lat) || isNaN(lng)) continue
        path.push({ lat, lng })
      }

      if (path.length < 2) continue

      const upper = nama.toUpperCase()
      let tipe = 'SUTT'
      if (upper.includes('SUTET') || upper.includes('500KV') || upper.includes('500 KV')) tipe = 'SUTET'
      else if (upper.includes('SKTT')) tipe = 'SKTT'

      let warna: string | null = null
      const colorMatch = placemark.match(/<color>\s*([0-9a-fA-F]{8})\s*<\/color>/i)
      if (colorMatch) {
        const kml = colorMatch[1]
        warna = `#${kml.substring(6, 8)}${kml.substring(4, 6)}${kml.substring(2, 4)}`
      }

      results.push({ nama, tipe, warna, path })
    }

    return results
  }

  async parseAndSave(buffer: Buffer, originalName: string): Promise<{
    towers: number
    jalur: number
    towerNames: string[]
    jalurNames: string[]
  }> {
    const content = buffer.toString('utf-8')

    if (!content.includes('<kml') && !content.includes('<KML')) {
      throw new BadRequestException('File bukan format KML yang valid')
    }

    const points = this.parsePoints(content)
    const jalurList = this.parseJalur(content)

    if (points.length === 0 && jalurList.length === 0) {
      throw new BadRequestException('Tidak ada data tower, gardu, atau jalur yang ditemukan dalam file KML')
    }

    // Upsert towers/gardu — skip jika nama sudah ada
    const towerNames: string[] = []
    for (const pt of points) {
      const existing = await this.prisma.tower.findFirst({ where: { nama: pt.nama } })
      if (existing) {
        // Update jalur field jika sebelumnya kosong
        if (!existing.jalur && pt.jalur) {
          await this.prisma.tower.update({ where: { id: existing.id }, data: { jalur: pt.jalur } })
        }
        continue
      }

      const id = this.generateTowerId(pt.nama, pt.tipe)
      const finalId = await this.ensureUniqueId(id)

      await this.prisma.tower.create({
        data: {
          id: finalId,
          nama: pt.nama,
          lat: pt.lat,
          lng: pt.lng,
          tipe: pt.tipe,
          tegangan: pt.tegangan,
          kondisi: 'normal',
          jalur: pt.jalur ?? undefined,
        },
      })
      towerNames.push(pt.nama)
    }

    // Insert jalur
    const jalurNames: string[] = []
    for (const item of jalurList) {
      await this.prisma.jalurKML.create({
        data: { nama: item.nama, tipe: item.tipe, warna: item.warna, path: JSON.parse(JSON.stringify(item.path)) },
      })
      jalurNames.push(item.nama)
    }

    return { towers: towerNames.length, jalur: jalurNames.length, towerNames, jalurNames }
  }

  private async ensureUniqueId(baseId: string): Promise<string> {
    let id = baseId
    let counter = 1
    while (await this.prisma.tower.findUnique({ where: { id } })) {
      id = `${baseId}-${counter++}`
    }
    return id
  }

  async findAll() {
    return this.prisma.jalurKML.findMany({ orderBy: { createdAt: 'desc' } })
  }

  async remove(id: number): Promise<void> {
    await this.prisma.jalurKML.delete({ where: { id } })
  }
}
