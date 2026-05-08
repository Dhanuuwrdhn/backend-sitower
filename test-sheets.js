const XLSX = require('xlsx');
const wb = XLSX.readFile('../frontend-sitower/Data PPL dan Kerawanan ULTG Durikosambi.xlsx');
console.log('Sheets:', wb.SheetNames);
