const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const XLSX = require('xlsx');

async function run() {
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

  console.log(`[Import] Total rows: ${rows.length}, Valid rows: ${validRows.length}`);

  let createdCount = 0;
  for (const r of validRows.slice(0, 5)) {
    try {
      let rawTowerId = String(r.towerId || r['NO. TOWER'] || r['SPAN'] || 'UNKNOWN-TOWER');
      let rawPelapor = String(r.pelaporId || r['PETUGAS LW'] || 'Teknisi Default');
      
      let jenisGangguan = String(r.jenisGangguan || r.kategori || r['KLASIFIKASI '] || r['KLASIFIKASI'] || 'pekerjaan_pihak_lain').trim()
      if (jenisGangguan.toLowerCase().includes('pihak lain') || jenisGangguan.toLowerCase() === 'ppl') jenisGangguan = 'pekerjaan_pihak_lain'
      else if (jenisGangguan.toLowerCase().includes('layangan')) jenisGangguan = 'layangan'
      else if (jenisGangguan.toLowerCase().includes('kebakaran')) jenisGangguan = 'kebakaran'
      else if (jenisGangguan.toLowerCase().includes('pencurian')) jenisGangguan = 'pencurian'
      else if (jenisGangguan.toLowerCase().includes('pemanfaatan')) jenisGangguan = 'pemanfaatan'
      else jenisGangguan = 'gangguan' 

      const deskripsi   = String(r.deskripsi || r['URAIAN PEKERJAAN'] || '')
      const keterangan  = (r.keterangan || r['PENGENDALIAN'] || '') + (r['PIHAK LAIN'] ? `\nPihak Lain: ${r['PIHAK LAIN']}` : '')
      
      let statusStr = String(r.status || r['STATUS'] || 'berlangsung').trim()
      if (statusStr.toLowerCase().includes('selesai')) statusStr = 'selesai'
      else if (statusStr.toLowerCase().includes('berlangsung')) statusStr = 'berlangsung'
      else if (statusStr.toLowerCase().includes('ditangani')) statusStr = 'ditangani'
      else if (statusStr.toLowerCase().includes('pantau')) statusStr = 'pemantauan'
      else statusStr = 'berlangsung' 
      
      const levelRisiko = String(r.levelRisiko || r.level || 'rendah')
      const tanggal = r.tanggal ? new Date(r.tanggal) : new Date()

      rawPelapor = rawPelapor.trim()
      let pegawai = await prisma.pegawai.findFirst({ where: { nama: rawPelapor } })
      if (!pegawai) {
        pegawai = await prisma.pegawai.create({
          data: {
            nik: 'NIK-' + Date.now() + Math.floor(Math.random() * 1000),
            nama: rawPelapor,
            jabatan: 'Petugas Lapangan',
            unit: 'ULTG',
            role: 'teknisi',
            password: 'password123',
          }
        })
      }

      rawTowerId = rawTowerId.trim()
      let tower = await prisma.tower.findUnique({ where: { id: rawTowerId } })
      if (!tower) {
        const ruas = r['RUAS'] ? ` (${r['RUAS']})` : ''
        tower = await prisma.tower.create({
          data: {
            id: rawTowerId,
            nama: `Tower/Span ${rawTowerId}${ruas}`,
            lat: 0,
            lng: 0,
            tegangan: '150 kV',
            tipe: 'other',
          }
        })
      }

      await prisma.laporan.create({
        data: {
          towerId: tower.id,
          pelaporId: pegawai.id,
          jenisGangguan: jenisGangguan,
          deskripsi: deskripsi,
          levelRisiko: levelRisiko,
          status: statusStr,
          tanggal: tanggal,
          lokasiDetail: r.lokasiDetail || r.lokasi || r['RUAS'] || null,
          keterangan: keterangan,
          foto: r.foto ? String(r.foto).split(',').map((s) => s.trim()) : [],
        }
      });
      createdCount++;
      console.log('Created row:', rawTowerId);
    } catch (e) {
      console.error('Error creating row:', e.message);
    }
  }
  console.log('Total created:', createdCount);
}
run();
