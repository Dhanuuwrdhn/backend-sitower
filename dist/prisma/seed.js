"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const bcrypt = __importStar(require("bcrypt"));
const XLSX = __importStar(require("xlsx"));
const path = __importStar(require("path"));
require("dotenv/config");
const adapter = new adapter_pg_1.PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new client_1.PrismaClient({ adapter });
const GARDU_DATA = [
    { kode: 'KBG', nama: 'GI Kembangan', lat: -6.1880, lng: 106.7200, tegangan: '150kV' },
    { kode: 'PTK', nama: 'GI Petukangan', lat: -6.2620, lng: 106.7430, tegangan: '150kV' },
    { kode: 'GND', nama: 'GI Gandul', lat: -6.3530, lng: 106.7930, tegangan: '150kV' },
    { kode: 'DKS', nama: 'GI Durikosambi', lat: -6.1710, lng: 106.7260, tegangan: '150kV' },
    { kode: 'CKG', nama: 'GI Cengkareng', lat: -6.1510, lng: 106.6590, tegangan: '150kV' },
    { kode: 'CKGB', nama: 'GI Cengkareng Baru', lat: -6.1515, lng: 106.6585, tegangan: '150kV' },
    { kode: 'TNGB', nama: 'GI Tangerang Baru', lat: -6.1570, lng: 106.6000, tegangan: '150kV' },
    { kode: 'TNGL', nama: 'GI Tangerang Lama', lat: -6.2120, lng: 106.6340, tegangan: '150kV' },
];
const ROUTE_DEFS = [
    { nama: 'SUTT KEMBANGAN - PETUKANGAN', dari: 'KBG', ke: 'PTK', prefix: 'KBG-PTK' },
    { nama: 'SUTT KEMBANGAN - DURIKOSAMBI', dari: 'KBG', ke: 'DKS', prefix: 'KBG-DKS' },
    { nama: 'SUTT GANDUL - KEMBANGAN', dari: 'GND', ke: 'KBG', prefix: 'GND-KBG' },
    { nama: 'SUTT GANDUL - KEMBANGAN + DURIKOSAMBI', dari: 'GND', ke: 'KBG', prefix: 'GND-KBG-D' },
    { nama: 'SUTT DURIKOSAMBI - CENGKARENG', dari: 'DKS', ke: 'CKG', prefix: 'DKS-CKG' },
    { nama: 'SUTT DURIKOSAMBI - TANGERANG LAMA + DURIKOSAMBI - CENGKARENG', dari: 'DKS', ke: 'CKGB', prefix: 'DKS-TNGL' },
    { nama: 'SUTT TANGERANG - CENGKARENG', dari: 'TNGL', ke: 'CKG', prefix: 'TNG-CKG' },
    { nama: 'SUTT CENGKARENG BARU - TANGERANG BARU', dari: 'CKGB', ke: 'TNGB', prefix: 'CKGB-TNGB' },
];
const ROUTE_PREFIX = {};
ROUTE_DEFS.forEach((r) => { ROUTE_PREFIX[r.nama] = r.prefix; });
function normalizeRoute(raw) {
    return raw
        .replace('SUTTTANGERANG', 'SUTT TANGERANG')
        .replace(/TANGERANG-\s/, 'TANGERANG - ')
        .replace(/DURIKOSAMBI-TANGERANG LAMA/, 'DURIKOSAMBI - TANGERANG LAMA')
        .replace(/\s*\+\s*/g, ' + ')
        .trim();
}
function parseDescription(desc) {
    const lines = desc.split('\n').map((l) => l.trim()).filter(Boolean);
    let pplNotes = null;
    let penanggungJawab = null;
    let telepon = null;
    let sertifikatLink = null;
    for (const line of lines) {
        if (line.startsWith('https://drive.google.com')) {
            sertifikatLink = line;
        }
        else if (/^Penanggung Jawab\s*:/i.test(line)) {
            const val = line.replace(/^Penanggung Jawab\s*:\s*/i, '').trim();
            const m = val.match(/\((\(?\d[\d\s\-\(\)]+)\)\s*$/);
            if (m) {
                penanggungJawab = val.replace(m[0], '').trim();
                telepon = m[1].replace(/[()]/g, '').trim();
            }
            else {
                penanggungJawab = val;
            }
        }
        else if (line.startsWith('- ') && !line.includes('drive.google.com')) {
            const note = line.substring(2).trim();
            pplNotes = pplNotes ? `${pplNotes}; ${note}` : note;
        }
    }
    return { pplNotes, penanggungJawab, telepon, sertifikatLink };
}
function mapStatus(excelStatus, color) {
    const s = (excelStatus || 'AMAN').toUpperCase().trim();
    const c = (color || 'Lime').toLowerCase();
    if (s === 'PPL') {
        return { statusKerawanan: c === 'red' ? 'kritis' : 'sedang', jenisKerawanan: 'ppl' };
    }
    if (s.startsWith('LAYANG')) {
        return { statusKerawanan: 'sedang', jenisKerawanan: 'layangan' };
    }
    return { statusKerawanan: 'aman', jenisKerawanan: null };
}
async function main() {
    const adminPass = await bcrypt.hash('admin123', 10);
    const teknisiPass = await bcrypt.hash('teknisi123', 10);
    for (const p of [
        { nik: '1234567890123456', nama: 'Budi Santoso', jabatan: 'Supervisor Transmisi', unit: 'UP3 Banten', role: 'admin', password: adminPass, aktif: true },
        { nik: '9876543210987654', nama: 'Siti Rahayu', jabatan: 'Teknisi Senior', unit: 'UP3 Tangerang', role: 'teknisi', password: teknisiPass, aktif: true },
        { nik: '1122334455667788', nama: 'Ahmad Fauzi', jabatan: 'Teknisi Lapangan', unit: 'UIW Banten', role: 'teknisi', password: teknisiPass, aktif: true },
    ]) {
        await prisma.pegawai.upsert({ where: { nik: p.nik }, update: p, create: p });
    }
    const lineTypes = await Promise.all([
        prisma.transmissionLineType.upsert({ where: { kode: 'SUTT' }, update: {}, create: { kode: 'SUTT', tegangan: '150kV', warna: '#0000FF', lineStyle: 'solid' } }),
        prisma.transmissionLineType.upsert({ where: { kode: 'SUTET' }, update: {}, create: { kode: 'SUTET', tegangan: '500kV', warna: '#FF0000', lineStyle: 'solid' } }),
        prisma.transmissionLineType.upsert({ where: { kode: 'SKTT' }, update: {}, create: { kode: 'SKTT', tegangan: '150kV', warna: '#800080', lineStyle: 'dashed' } }),
    ]);
    const suttId = lineTypes[0].id;
    const garduMap = {};
    for (const g of GARDU_DATA) {
        const rec = await prisma.garduInduk.upsert({
            where: { kode: g.kode },
            update: { nama: g.nama, lat: g.lat, lng: g.lng, tegangan: g.tegangan },
            create: g,
        });
        garduMap[g.kode] = rec.id;
    }
    const routeMap = {};
    for (const r of ROUTE_DEFS) {
        const existing = await prisma.transmissionRoute.findFirst({ where: { nama: r.nama } });
        const rec = existing ?? await prisma.transmissionRoute.create({
            data: { nama: r.nama, lineTypeId: suttId, garduDariId: garduMap[r.dari], garduKeId: garduMap[r.ke] },
        });
        routeMap[r.nama] = rec.id;
    }
    const excelPath = path.join(__dirname, 'data', 'EXCELL SENSITIF PLN ULTG DKSBI.xls');
    const wb = XLSX.readFile(excelPath);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
    const routeOrderMap = {};
    for (let i = 6; i < rows.length; i++) {
        const row = rows[i];
        if (!row[0] && !row[2])
            continue;
        const lat = parseFloat(String(row[0]).trim());
        const lng = parseFloat(String(row[1]).trim());
        const towerCode = String(row[2] || '').trim();
        const desc = String(row[3] || '');
        const excelSt = String(row[4] || 'AMAN');
        const color = String(row[5] || 'Lime');
        if (!towerCode || isNaN(lat) || isNaN(lng))
            continue;
        const line1 = desc.split('\n')[0].trim();
        const routeMatch = line1.match(/^(.*?)\s+TOWER/i);
        const routeName = routeMatch ? normalizeRoute(routeMatch[1].trim()) : '';
        const routeId = routeMap[routeName] ?? null;
        const prefix = ROUTE_PREFIX[routeName];
        const towerId = prefix ? `${prefix}-${towerCode}` : towerCode;
        routeOrderMap[routeName] = (routeOrderMap[routeName] || 0) + 1;
        const nomorUrut = routeOrderMap[routeName];
        const parsed = parseDescription(desc);
        const status = mapStatus(excelSt, color);
        await prisma.tower.upsert({
            where: { id: towerId },
            update: { nama: line1, lat, lng, tegangan: '150kV', tipe: 'SUTT', kondisi: 'normal', jalur: routeName, nomorUrut, routeId, ...status, ...parsed },
            create: { id: towerId, nama: line1, lat, lng, tegangan: '150kV', tipe: 'SUTT', kondisi: 'normal', jalur: routeName, nomorUrut, routeId, ...status, ...parsed },
        });
    }
    const towerCount = await prisma.tower.count();
    console.log(`✓ Seed selesai: ${towerCount} tower, ${Object.keys(routeMap).length} jalur, ${GARDU_DATA.length} gardu induk`);
}
main().catch(console.error).finally(() => prisma.$disconnect());
//# sourceMappingURL=seed.js.map