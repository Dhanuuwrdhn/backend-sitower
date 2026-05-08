const XLSX = require('xlsx');
const wb = XLSX.readFile('../frontend-sitower/Data PPL dan Kerawanan ULTG Durikosambi.xlsx');
const sheet = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet);

const validRows = rows.filter(r => {
  const isInstruction = 
    r['RUAS'] === 'Otomatis by foto lokasi' || 
    r['URAIAN PEKERJAAN'] === 'Input manual' ||
    String(r['NO']).toLowerCase().includes('no')
  
  const hasContent = r.towerId || r['NO. TOWER'] || r['SPAN'] || r['URAIAN PEKERJAAN']
  return !isInstruction && hasContent
});

console.log('Total valid rows:', validRows.length);
if (validRows.length > 0) {
  console.log('First valid row:', validRows[0]);
}
