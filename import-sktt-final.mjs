import * as XLSX from 'xlsx';
import * as fs from 'fs';
import pg from 'pg';
import { randomUUID } from 'crypto';

const { Pool } = pg;
const pool = new Pool({
  user: 'staging_user',
  password: 'SiT0wer_Staging!',
  host: '129.226.95.198',
  port: 5432,
  database: 'sitower_staging',
});

async function main() {
  const client = await pool.connect();
  try {
    console.log('🔗 Connecting to staging database...');

    console.log('🧹 Clearing existing SKTT data...');
    await client.query('DELETE FROM "Tower" WHERE tipe = $1', ['SKTT']);
    await client.query('DELETE FROM "JalurKML" WHERE tipe = $1', ['SKTT']);

    const buffer = fs.readFileSync('../frontend-sitower/Data-Aset-Transmisi.xlsx');
    const wb = XLSX.read(buffer, { cellDates: true });
    const sheetName = wb.SheetNames.find(s => s.toLowerCase().includes('sktt'));
    if (!sheetName) throw new Error('SKTT sheet not found');

    const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName]);
    console.log(`📊 Read ${rows.length} rows from SKTT sheet`);

    let inserted = 0;
    let skipped = 0;
    const routeMap = new Map();

    for (const row of rows) {
      const ruas = String(row['RUAS'] || '').trim();
      const bayPenghantar = String(row['BAY_PENGHANTAR'] || '').trim();
      const nosirkuit = String(row['NOSIRKIT'] || '').trim();
      const rawLat = row['KOORDINAT_X'];
      const rawLng = row['KOORDINAT_Y'];
      const lat = Number(rawLat) / 1e7;
      const lng = Number(rawLng) / 1e7;

      if (!ruas || !bayPenghantar || !rawLat || !rawLng || isNaN(lat) || isNaN(lng)) {
        skipped++;
        continue;
      }

      const id = randomUUID();
      const nama = ruas;
      const lokasi = `${bayPenghantar}${nosirkuit ? ' (' + nosirkuit + ')' : ''}`;
      const tegangan = '150kV';
      const tipe = 'SKTT';

      await client.query(
        `INSERT INTO "Tower" (id, nama, lat, lng, tegangan, tipe, kondisi, lokasi, jalur, "createdAt", "updatedAt", "statusKerawanan")
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW(),NOW(),$10)`,
        [id, nama, lat, lng, tegangan, tipe, 'normal', lokasi, ruas, 'aman']
      );
      inserted++;

      if (!routeMap.has(ruas)) routeMap.set(ruas, []);
      routeMap.get(ruas).push({ lat, lng, isMarker: true });
    }

    console.log(`✓ Inserted ${inserted} SKTT towers`);
    console.log(`✓ Skipped ${skipped} invalid rows`);

    let routeCount = 0;
    for (const [ruas, path] of routeMap) {
      await client.query(
        `INSERT INTO "JalurKML" (nama, tipe, warna, path, "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,NOW(),NOW())`,
        [ruas, 'SKTT', '#FF00FF', JSON.stringify(path)]
      );
      routeCount++;
    }

    console.log(`✓ Inserted ${routeCount} SKTT routes`);

    const countTower = await client.query('SELECT COUNT(*) as count FROM "Tower" WHERE tipe = $1', ['SKTT']);
    const countRoute = await client.query('SELECT COUNT(*) as count FROM "JalurKML" WHERE tipe = $1', ['SKTT']);
    console.log(`✅ Total SKTT towers: ${countTower.rows[0].count}`);
    console.log(`✅ Total SKTT routes: ${countRoute.rows[0].count}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
