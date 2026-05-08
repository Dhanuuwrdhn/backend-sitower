const XLSX = require('xlsx');
const wb = XLSX.readFile('../frontend-sitower/Data PPL dan Kerawanan ULTG Durikosambi.xlsx');
const sheet = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet);
console.log('Total rows:', rows.length);
if (rows.length > 0) {
  console.log('Row 0 keys:', Object.keys(rows[0]));
  console.log('Row 0 values:', Object.values(rows[0]));
  console.log('Row 5 keys:', Object.keys(rows[5]));
  console.log('Row 5 values:', Object.values(rows[5]));
}
