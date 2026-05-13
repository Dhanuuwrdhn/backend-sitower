import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
  user: 'staging_user',
  password: 'SiT0wer_Staging!',
  host: '129.226.95.198',
  port: 5432,
  database: 'sitower_staging',
});
(async () => {
  const client = await pool.connect();
  try {
    const delTower = await client.query('DELETE FROM "Tower" WHERE tipe = $1', ['SKTT']);
    const delRoute = await client.query('DELETE FROM "JalurKML" WHERE tipe = $1', ['SKTT']);
    const countTower = await client.query('SELECT COUNT(*) as count FROM "Tower" WHERE tipe = $1', ['SKTT']);
    const countRoute = await client.query('SELECT COUNT(*) as count FROM "JalurKML" WHERE tipe = $1', ['SKTT']);
    console.log('Deleted SKTT towers:', delTower.rowCount);
    console.log('Deleted SKTT routes:', delRoute.rowCount);
    console.log('Remaining SKTT towers:', countTower.rows[0].count);
    console.log('Remaining SKTT routes:', countRoute.rows[0].count);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
})();
