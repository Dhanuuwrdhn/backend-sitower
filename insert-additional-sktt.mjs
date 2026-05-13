import pg from 'pg';
import { randomUUID } from 'crypto';

const { Pool } = pg;
const pool = new Pool({
  user: 'staging_user',
  password: 'SiT0wer_Staging!',
  host: '129.226.95.198',
  port: 5432,
  database: 'sitower_staging'
});

async function insertAdditionalSKTT() {
  try {
    console.log('🔗 Connecting to staging database...');

    // Additional SKTT data to insert
    const additionalData = [
      {
        nama: 'GI 150KV CENGKARENG BARU',
        lokasi: 'SPAN SKTT 150kV CKBRU-ITS 2 #000SE-SE',
        latitude: -6.1501155,
        longitude: 106.65906
      },
      {
        nama: 'GI 150KV CENGKARENG BARU',
        lokasi: 'SPAN SKTT 150kV CKBRU-TGRBR 1 #000SE-SE',
        latitude: -6.1501155,
        longitude: 106.65906
      }
    ];

    for (const data of additionalData) {
      const id = randomUUID();
      await pool.query(`
        INSERT INTO "Tower" (id, nama, lokasi, latitude, longitude, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      `, [id, data.nama, data.lokasi, data.latitude, data.longitude]);

      console.log(`✓ Inserted tower: ${data.lokasi}`);
    }

    console.log('✅ Additional SKTT towers inserted successfully');

  } catch (error) {
    console.error('❌ Error inserting additional SKTT data:', error);
  } finally {
    await pool.end();
  }
}

insertAdditionalSKTT();