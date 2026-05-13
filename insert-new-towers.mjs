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

import crypto from 'crypto';

async function main() {
  try {
    const client = await pool.connect();

    // Delete incorrectly inserted data
    await client.query(`DELETE FROM "Tower" WHERE id IN ('SPAN SKTT 150kV CKBRU-ITS 2 #000SE-SE', 'SPAN SKTT 150kV CKBRU-TGRBR 1 #000SE-SE')`);
    console.log('Deleted incorrect records');

    const towers = [
      {
        id: crypto.randomUUID(),
        nama: 'SPAN SKTT 150kV CKBRU-ITS 2 #000SE-SE',
        lokasi: 'GI 150KV CENGKARENG BARU',
        lat: -6.1501155,
        lng: 106.65906,
        tegangan: '150kV',
        tipe: 'SKTT',
      },
      {
        id: crypto.randomUUID(),
        nama: 'SPAN SKTT 150kV CKBRU-TGRBR 1 #000SE-SE',
        lokasi: 'GI 150KV CENGKARENG BARU',
        lat: -6.1501155,
        lng: 106.65906,
        tegangan: '150kV',
        tipe: 'SKTT',
      }
    ];

    for (const t of towers) {
      await client.query(
        `INSERT INTO "Tower" (id, nama, lokasi, lat, lng, tegangan, tipe, kondisi, radius, "createdAt", "updatedAt", "statusKerawanan") 
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'normal', 100, NOW(), NOW(), 'aman')`,
        [t.id, t.nama, t.lokasi, t.lat, t.lng, t.tegangan, t.tipe]
      );
      console.log(`Inserted: ${t.nama} with ID: ${t.id}`);
    }

    client.release();
    console.log('Done!');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

main();
