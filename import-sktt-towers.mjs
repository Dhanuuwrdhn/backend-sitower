import * as XLSX from 'xlsx';
import * as fs from 'fs';
import pg from 'pg';

const { Pool } = pg;

// Staging database config
const pool = new Pool({
  user: 'staging_user',
  password: 'SiT0wer_Staging!',
  host: '129.226.95.198',
  port: 5432,
  database: 'sitower_staging',
});

async function main() {
  try {
    console.log('🔗 Connecting to staging database...');
    const client = await pool.connect();

    // ──────────────────────────────────────────────────────────────
    // STEP 1: Clear old SKTT towers
    // ──────────────────────────────────────────────────────────────
    console.log('\n🧹 Step 1: Clearing old SKTT towers...');
    const deleteResult = await client.query(
      'DELETE FROM "Tower" WHERE tipe = $1',
      ['SKTT']
    );
    console.log(`   ✓ Deleted ${deleteResult.rowCount} old SKTT towers`);

    // ──────────────────────────────────────────────────────────────
    // STEP 2: Read & parse Excel SKTT data
    // ──────────────────────────────────────────────────────────────
    console.log('\n📊 Step 2: Reading Excel file...');
    const buffer = fs.readFileSync('../frontend-sitower/Data-Aset-Transmisi.xlsx');
    const wb = XLSX.read(buffer);
    const skttSheet = wb.SheetNames.find(s => s.toLowerCase().includes('sktt'));
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[skttSheet]);
    console.log(`   ✓ Read ${rows.length} SKTT rows from Excel`);

    // ──────────────────────────────────────────────────────────────
    // STEP 3: Process & insert towers
    // ──────────────────────────────────────────────────────────────
    console.log('\n🏗️  Step 3: Processing & inserting SKTT towers...');
    let insertCount = 0;
    let skipCount = 0;

    for (const row of rows) {
      const ruas = String(row['RUAS'] || '').trim();
      const bayPenghantar = String(row['BAY_PENGHANTAR'] || '').trim();
      const lat = Number(row['KOORDINAT_X']) / 1e7; // Convert from int to decimal
      const lng = Number(row['KOORDINAT_Y']) / 1e7;
      const nosirkuit = String(row['NOSIRKIT'] || '').trim();

      // Skip invalid data
      if (!ruas || !bayPenghantar || isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
        skipCount++;
        continue;
      }

      // Generate ID: SKTT-{RUAS_CODE}-{BAY_NUMBER}
      const ruasCode = ruas.replace(/[^A-Z0-9]/g, '').substring(0, 10);
      const bayMatch = bayPenghantar.match(/#(\d+)/);
      const bayNum = bayMatch ? bayMatch[1] : '001';
      const id = `SKTT-${ruasCode}-${bayNum}`;

      // Generate nama tower
      const nama = `${bayPenghantar} (${nosirkuit})`;

      try {
        await client.query(
          `INSERT INTO "Tower" (
            id, nama, lat, lng, tegangan, tipe, kondisi, jalur, 
            "createdAt", "updatedAt", "statusKerawanan"
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW(), $9)
          ON CONFLICT (id) DO UPDATE SET
            nama = EXCLUDED.nama,
            lat = EXCLUDED.lat,
            lng = EXCLUDED.lng,
            tegangan = EXCLUDED.tegangan,
            kondisi = EXCLUDED.kondisi,
            jalur = EXCLUDED.jalur,
            "updatedAt" = NOW()`,
          [id, nama, lat, lng, '150kV', 'SKTT', 'normal', ruas, 'aman']
        );
        insertCount++;
      } catch (err) {
        console.log(`   ⚠️  Skip ${id}: ${err.message}`);
        skipCount++;
      }
    }
    console.log(`   ✓ Inserted ${insertCount} SKTT towers`);
    console.log(`   ⚠️  Skipped ${skipCount} invalid rows`);

    // ──────────────────────────────────────────────────────────────
    // STEP 4: Update JalurKML from towers
    // ──────────────────────────────────────────────────────────────
    console.log('\n🗺️  Step 4: Updating JalurKML from towers...');
    
    // Clear old SKTT routes
    await client.query('DELETE FROM "JalurKML" WHERE tipe = $1', ['SKTT']);
    
    // Get all SKTT towers grouped by jalur
    const towersResult = await client.query(
      'SELECT jalur, array_agg(json_build_object(\'lat\', lat, \'lng\', lng, \'isMarker\', true) ORDER BY id) as path FROM "Tower" WHERE tipe = $1 GROUP BY jalur',
      ['SKTT']
    );
    
    let routeCount = 0;
    for (const row of towersResult.rows) {
      await client.query(
        `INSERT INTO "JalurKML" (nama, tipe, warna, path, "createdAt", "updatedAt") 
         VALUES ($1, $2, $3, $4, NOW(), NOW())`,
        [row.jalur, 'SKTT', '#FF00FF', JSON.stringify(row.path)]
      );
      routeCount++;
    }
    console.log(`   ✓ Created ${routeCount} SKTT routes`);

    // ──────────────────────────────────────────────────────────────
    // STEP 5: Verify
    // ──────────────────────────────────────────────────────────────
    console.log('\n✅ Step 5: Verification...');
    const towerResult = await client.query(
      'SELECT COUNT(*) as count FROM "Tower" WHERE tipe = $1',
      ['SKTT']
    );
    const routeResult = await client.query(
      'SELECT COUNT(*) as count FROM "JalurKML" WHERE tipe = $1',
      ['SKTT']
    );
    
    console.log(`   ✓ SKTT towers in database: ${towerResult.rows[0].count}`);
    console.log(`   ✓ SKTT routes in database: ${routeResult.rows[0].count}`);

    client.release();
    console.log('\n✨ Import SKTT towers staging selesai!');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
