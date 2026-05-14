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
    // STEP 1: Clear old SKTT data
    // ──────────────────────────────────────────────────────────────
    console.log('\n🧹 Step 1: Clearing old SKTT data...');
    const deleteResult = await client.query(
      'DELETE FROM "JalurKML" WHERE tipe = $1',
      ['SKTT']
    );
    console.log(`   ✓ Deleted ${deleteResult.rowCount} old SKTT records`);

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
    // STEP 3: Group by RUAS & build path
    // ──────────────────────────────────────────────────────────────
    console.log('\n🗺️  Step 3: Grouping by RUAS & building paths...');
    const routeMap = new Map();
    for (const row of rows) {
      const ruas = String(row['RUAS'] || '').trim();
      const lat = Number(row['KOORDINAT_X']) / 1e7; // Convert from int to decimal
      const lng = Number(row['KOORDINAT_Y']) / 1e7;
      
      if (!ruas || isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) continue;
      
      if (!routeMap.has(ruas)) routeMap.set(ruas, []);
      routeMap.get(ruas).push({ lat, lng, isMarker: true });
    }
    console.log(`   ✓ Grouped into ${routeMap.size} unique routes`);

    // ──────────────────────────────────────────────────────────────
    // STEP 4: Insert routes into database
    // ──────────────────────────────────────────────────────────────
    console.log('\n💾 Step 4: Inserting routes into database...');
    let insertCount = 0;
    for (const [nama, path] of routeMap) {
      await client.query(
        `INSERT INTO "JalurKML" (nama, tipe, warna, path, "createdAt", "updatedAt") 
         VALUES ($1, $2, $3, $4, NOW(), NOW())`,
        [nama, 'SKTT', '#FF00FF', JSON.stringify(path)]
      );
      insertCount++;
    }
    console.log(`   ✓ Inserted ${insertCount} routes`);

    // ──────────────────────────────────────────────────────────────
    // STEP 5: Verify
    // ──────────────────────────────────────────────────────────────
    console.log('\n✅ Step 5: Verification...');
    const verifyResult = await client.query(
      'SELECT COUNT(*) as count FROM "JalurKML" WHERE tipe = $1',
      ['SKTT']
    );
    const finalCount = verifyResult.rows[0].count;
    console.log(`   ✓ Final SKTT records in database: ${finalCount}`);

    client.release();
    console.log('\n✨ Import SKTT staging selesai!');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
