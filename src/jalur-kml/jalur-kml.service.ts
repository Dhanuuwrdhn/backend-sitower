import { Injectable, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

interface CoordPoint {
  lat: number
  lng: number
}

@Injectable()
export class JalurKmlService {
  constructor(private prisma: PrismaService) {}

  /**
   * Parse KML XML content and extract all Placemark LineString coordinates.
   * KML coordinate format: lng,lat,alt per point, separated by whitespace/newline.
   */
  private parseKml(content: string): Array<{ nama: string; tipe: string; warna: string | null; path: CoordPoint[] }> {
    const results: Array<{ nama: string; tipe: string; warna: string | null; path: CoordPoint[] }> = []

    // Extract all <Placemark> blocks
    const placemarkRegex = /<Placemark[\s\S]*?<\/Placemark>/gi
    const placemarks = content.match(placemarkRegex) ?? []

    for (const placemark of placemarks) {
      // Check if this Placemark has a LineString
      if (!/<LineString/i.test(placemark)) continue

      // Extract name
      const nameMatch = placemark.match(/<name>\s*([\s\S]*?)\s*<\/name>/i)
      const nama = nameMatch ? nameMatch[1].trim().replace(/<!\[CDATA\[([\s\S]*?)\]\]>/, '$1').trim() : 'Jalur KML'

      // Extract coordinates from LineString
      const coordMatch = placemark.match(/<coordinates>\s*([\s\S]*?)\s*<\/coordinates>/i)
      if (!coordMatch) continue

      const rawCoords = coordMatch[1].trim()
      const path: CoordPoint[] = []

      // Each coordinate entry: lng,lat or lng,lat,alt
      const coordEntries = rawCoords.split(/[\s\n\r]+/).filter((s) => s.trim().length > 0)
      for (const entry of coordEntries) {
        const parts = entry.trim().split(',')
        if (parts.length < 2) continue
        const lng = parseFloat(parts[0])
        const lat = parseFloat(parts[1])
        if (isNaN(lat) || isNaN(lng)) continue
        path.push({ lat, lng })
      }

      if (path.length < 2) continue

      // Detect transmission type from name
      const upperNama = nama.toUpperCase()
      let tipe = 'SUTT'
      if (upperNama.includes('SUTET') || upperNama.includes('500KV') || upperNama.includes('500 KV')) {
        tipe = 'SUTET'
      } else if (upperNama.includes('SKTT')) {
        tipe = 'SKTT'
      }

      // Extract color from styleUrl or Style if present
      let warna: string | null = null
      const colorMatch = placemark.match(/<color>\s*([0-9a-fA-F]{8})\s*<\/color>/i)
      if (colorMatch) {
        // KML color is aabbggrr (alpha, blue, green, red) — convert to #rrggbb
        const kmlColor = colorMatch[1]
        const r = kmlColor.substring(6, 8)
        const g = kmlColor.substring(4, 6)
        const b = kmlColor.substring(2, 4)
        warna = `#${r}${g}${b}`
      }

      results.push({ nama, tipe, warna, path })
    }

    return results
  }

  async parseAndSave(buffer: Buffer, originalName: string): Promise<{ total: number; jalur: string[] }> {
    const content = buffer.toString('utf-8')

    if (!content.includes('<kml') && !content.includes('<KML')) {
      throw new BadRequestException('File bukan format KML yang valid')
    }

    const parsed = this.parseKml(content)

    if (parsed.length === 0) {
      throw new BadRequestException('Tidak ada LineString yang ditemukan dalam file KML')
    }

    const savedNames: string[] = []

    for (const item of parsed) {
      await this.prisma.jalurKML.create({
        data: {
          nama: item.nama,
          tipe: item.tipe,
          warna: item.warna,
          path: item.path,
        },
      })
      savedNames.push(item.nama)
    }

    return { total: savedNames.length, jalur: savedNames }
  }

  async findAll() {
    return this.prisma.jalurKML.findMany({
      orderBy: { createdAt: 'desc' },
    })
  }

  async remove(id: number): Promise<void> {
    await this.prisma.jalurKML.delete({ where: { id } })
  }
}
