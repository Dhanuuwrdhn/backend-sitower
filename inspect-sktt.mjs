import * as XLSX from 'xlsx';
import * as fs from 'fs';

const buffer = fs.readFileSync('../frontend-sitower/Data-Aset-Transmisi.xlsx');
const wb = XLSX.read(buffer);

console.log('📋 Sheets:', wb.SheetNames);

// Inspect SKTT sheet
const skttSheet = wb.SheetNames.find(s => s.toLowerCase().includes('sktt'));
if (!skttSheet) {
  console.error('❌ Sheet "sktt" tidak ditemukan!');
  console.log('Available sheets:', wb.SheetNames);
  process.exit(1);
}

console.log(`\n📊 Sheet: "${skttSheet}"`);
const rows = XLSX.utils.sheet_to_json(wb.Sheets[skttSheet]);
console.log(`   Total rows: ${rows.length}`);
if (rows.length > 0) {
  console.log(`   Headers:`, Object.keys(rows[0]));
  console.log(`\n   Sample row 1:`, JSON.stringify(rows[0], null, 2));
  if (rows.length > 1) console.log(`   Sample row 2:`, JSON.stringify(rows[1], null, 2));
}
