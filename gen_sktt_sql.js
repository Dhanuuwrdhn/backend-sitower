const XLSX = require('xlsx');
const fs = require('fs');
const buf = fs.readFileSync('/Users/dhanu/Downloads/Data Koordinat Jaringan.xlsx');
const wb = XLSX.read(buf, { type: 'buffer' });
const sheetName = wb.SheetNames.find(s => s.toUpperCase().includes('KOORDINAT SKTT'));
const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName]);

const routeMap = new Map();
for (const r of rows) {
  const ruas = String(r['RUAS'] || '').trim();
  const lat = Number(r['KOORDINAT_X']);
  const lng = Number(r['KOORDINAT_Y']);
  if (!ruas || isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) continue;
  if (!routeMap.has(ruas)) routeMap.set(ruas, new Map());
  const key = lat.toFixed(7) + ',' + lng.toFixed(7);
  if (!routeMap.get(ruas).has(key)) routeMap.get(ruas).set(key, { lat, lng, isMarker: true });
}

let sql = 'BEGIN;\n';
for (const [nama, ptsMap] of routeMap) {
  const path = JSON.stringify([...ptsMap.values()]).replace(/'/g, "''");
  const namaSafe = nama.replace(/'/g, "''");
  sql += `DELETE FROM "JalurKML" WHERE nama = '${namaSafe}' AND tipe = 'SKTT';\n`;
  sql += `INSERT INTO "JalurKML" (nama, tipe, warna, path, "createdAt", "updatedAt") VALUES ('${namaSafe}', 'SKTT', '#FF00FF', '${path}'::jsonb, NOW(), NOW());\n`;
}
sql += 'COMMIT;\n';
fs.writeFileSync('/tmp/sktt_insert.sql', sql);
console.log('Routes:', routeMap.size, '| SQL size:', sql.length);
