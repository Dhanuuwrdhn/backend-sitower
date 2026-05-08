import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as bcrypt from 'bcrypt'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma  = new PrismaClient({ adapter } as any)

async function main() {
  const adminPass   = await bcrypt.hash('admin123', 10)
  const teknisiPass = await bcrypt.hash('teknisi123', 10)

  const pegawai = [
    { nik:'1234567890123456', nama:'Budi Santoso',  jabatan:'Supervisor Transmisi', unit:'UP3 Banten',    role:'admin',   password:adminPass,   aktif:true },
    { nik:'9876543210987654', nama:'Siti Rahayu',   jabatan:'Teknisi Senior',       unit:'UP3 Tangerang', role:'teknisi', password:teknisiPass, aktif:true },
    { nik:'1122334455667788', nama:'Ahmad Fauzi',   jabatan:'Teknisi Lapangan',     unit:'UIW Banten',    role:'teknisi', password:teknisiPass, aktif:true },
  ]
  for (const p of pegawai) {
    await prisma.pegawai.upsert({ where:{nik:p.nik}, update:p, create:p })
  }

  const towers = [
    { id:'GI-001', nama:'GIS Lontar',                            lat:-6.060055, lng:106.463862, tegangan:'500 kV', tipe:'gardu', kondisi:'normal',      lokasi:'Lontar, Jakarta Utara' },
    { id:'GI-002', nama:'GISTET Kembangan',                      lat:-6.188128, lng:106.719739, tegangan:'500 kV', tipe:'gardu', kondisi:'normal',      lokasi:'Kembangan, Jakarta Barat' },
    { id:'GI-003', nama:'GI Angke',                              lat:-6.134313, lng:106.791144, tegangan:'150 kV', tipe:'gardu', kondisi:'normal',      lokasi:'Angke, Jakarta Barat' },
    { id:'GI-004', nama:'GI Durikosambi',                        lat:-6.170969, lng:106.725938, tegangan:'150 kV', tipe:'gardu', kondisi:'normal',      lokasi:'Durikosambi, Jakarta Barat' },
    { id:'GI-005', nama:'GIS Grogol',                            lat:-6.166449, lng:106.783709, tegangan:'150 kV', tipe:'gardu', kondisi:'normal',      lokasi:'Grogol, Jakarta Barat' },
    { id:'ST-001', nama:'TOWER SUTET KMBGN-DKSBI 500kV #P1A',   lat:-6.173349, lng:106.727639, tegangan:'500 kV', tipe:'SUTET', kondisi:'normal',      lokasi:'Kembangan, Jakarta Barat' },
    { id:'ST-002', nama:'TOWER SUTET KMBGN-DKSBI 500kV #P3',    lat:-6.190810, lng:106.731096, tegangan:'500 kV', tipe:'SUTET', kondisi:'waspada',     lokasi:'Kembangan, Jakarta Barat' },
    { id:'ST-003', nama:'TOWER SUTET BLRJA-JAWA7 500kV #001',   lat:-6.182300, lng:106.510200, tegangan:'500 kV', tipe:'SUTET', kondisi:'gangguan',    lokasi:'Balaraja, Tangerang' },
    { id:'TT-001', nama:'TOWER SUTT 150kV LNTAR-TLKGA #EA1',    lat:-6.060488, lng:106.463956, tegangan:'150 kV', tipe:'SUTT',  kondisi:'normal',      lokasi:'Lontar, Jakarta Utara' },
    { id:'TT-002', nama:'TOWER SUTT 150kV DKSBI-KMBNG #001',    lat:-6.172100, lng:106.726800, tegangan:'150 kV', tipe:'SUTT',  kondisi:'waspada',     lokasi:'Durikosambi, Jakarta Barat' },
    { id:'TT-003', nama:'TOWER SUTT 150kV GMKRU-PINKA #EA1A',   lat:-6.112300, lng:106.778900, tegangan:'150 kV', tipe:'SUTT',  kondisi:'maintenance', lokasi:'Gajah Mada, Tangerang' },
    { id:'SK-001', nama:'SKTT METLAND - KEMBANGAN #1',           lat:-6.188500, lng:106.740200, tegangan:'150 kV', tipe:'SKTT', kondisi:'normal',      lokasi:'Metland, Jakarta Barat' },
  ]
  for (const t of towers) {
    await prisma.tower.upsert({ where:{id:t.id}, update:t, create:t })
  }

  const siti  = await prisma.pegawai.findUnique({ where:{nik:'9876543210987654'} })
  const ahmad = await prisma.pegawai.findUnique({ where:{nik:'1122334455667788'} })

  await prisma.laporan.createMany({ skipDuplicates:true, data:[
    // PPL
    { towerId:'ST-003', pelaporId:siti!.id,  jenisGangguan:'pekerjaan_pihak_lain', deskripsi:'Proyek jalan tol memotong area ROW tower',         levelRisiko:'tinggi', status:'berlangsung', tanggal:new Date('2025-05-01T09:00:00'), lokasiDetail:'Balaraja, Tangerang', foto:[] },
    { towerId:'TT-002', pelaporId:ahmad!.id, jenisGangguan:'pekerjaan_pihak_lain', deskripsi:'Galian pipa PDAM dekat fondasi tower',              levelRisiko:'sedang', status:'ditangani',   tanggal:new Date('2025-04-28T10:00:00'), lokasiDetail:'Durikosambi, Jakarta Barat', foto:[] },
    // Kebakaran
    { towerId:'ST-002', pelaporId:siti!.id,  jenisGangguan:'kebakaran',            deskripsi:'Kebakaran semak belukar di bawah tower',            levelRisiko:'tinggi', status:'berlangsung', tanggal:new Date('2025-05-01T14:30:00'), lokasiDetail:'Kembangan, Jakarta Barat', foto:[] },
    { towerId:'TT-003', pelaporId:ahmad!.id, jenisGangguan:'kebakaran',            deskripsi:'Asap dari pembakaran sampah dekat tower',           levelRisiko:'sedang', status:'selesai',     tanggal:new Date('2025-04-25T11:00:00'), lokasiDetail:'Gajah Mada, Tangerang', foto:[] },
    // Layangan
    { towerId:'TT-001', pelaporId:siti!.id,  jenisGangguan:'layangan',             deskripsi:'Layangan tersangkut kawat fasa tengah',             levelRisiko:'sedang', status:'ditangani',   tanggal:new Date('2025-04-30T16:00:00'), lokasiDetail:'Lontar, Jakarta Utara', foto:[] },
    { towerId:'GI-003', pelaporId:ahmad!.id, jenisGangguan:'layangan',             deskripsi:'Benang layangan melilit isolator',                  levelRisiko:'rendah', status:'selesai',     tanggal:new Date('2025-04-27T15:00:00'), lokasiDetail:'Angke, Jakarta Barat', foto:[] },
    // Pencurian
    { towerId:'ST-003', pelaporId:ahmad!.id, jenisGangguan:'pencurian',            deskripsi:'Pencurian kawat konduktor tembaga',                 levelRisiko:'tinggi', status:'eskalasi',    tanggal:new Date('2025-04-29T22:00:00'), lokasiDetail:'Balaraja, Tangerang', foto:[] },
    { towerId:'TT-002', pelaporId:siti!.id,  jenisGangguan:'pencurian',            deskripsi:'Upaya pencurian baut fondasi tower',                levelRisiko:'sedang', status:'pemantauan',  tanggal:new Date('2025-04-26T08:00:00'), lokasiDetail:'Durikosambi, Jakarta Barat', foto:[] },
    // Pemanfaatan
    { towerId:'GI-004', pelaporId:ahmad!.id, jenisGangguan:'pemanfaatan',          deskripsi:'Warga mendirikan warung di dalam ROW',              levelRisiko:'rendah', status:'pemantauan',  tanggal:new Date('2025-04-24T10:00:00'), lokasiDetail:'Durikosambi, Jakarta Barat', foto:[] },
    { towerId:'SK-001', pelaporId:siti!.id,  jenisGangguan:'pemanfaatan',          deskripsi:'Kandang ayam di bawah jalur SKTT',                  levelRisiko:'sedang', status:'menunggu',    tanggal:new Date('2025-04-22T09:00:00'), lokasiDetail:'Metland, Jakarta Barat', foto:[] },
    // Gangguan Teknis
    { towerId:'ST-003', pelaporId:siti!.id,  jenisGangguan:'gangguan',             deskripsi:'Gangguan tegangan akibat sambaran petir',           levelRisiko:'tinggi', status:'berlangsung', tanggal:new Date('2025-05-01T04:22:00'), lokasiDetail:'Balaraja, Tangerang', penyebab:'Sambaran Petir', durasi:'—', foto:[] },
    { towerId:'ST-002', pelaporId:ahmad!.id, jenisGangguan:'gangguan',             deskripsi:'Trip saluran akibat angin kencang',                 levelRisiko:'sedang', status:'selesai',     tanggal:new Date('2025-04-26T14:10:00'), lokasiDetail:'Kembangan, Jakarta Barat', penyebab:'Angin Kencang', durasi:'2j 15m', foto:[] },
    // CUI
    { towerId:'ST-002', pelaporId:siti!.id,  jenisGangguan:'cui',                  deskripsi:'Climb Up Inspection rutin tower SUTET',             levelRisiko:'rendah', status:'selesai',     tanggal:new Date('2025-04-18T08:00:00'), lokasiDetail:'Kembangan, Jakarta Barat', teknisi:'Tim A — Rudi S.', temuan:'Korosi pada baut tower lantai 3', hasil:'Perlu penggantian segera', noSpk:'SPK-2025-0381', foto:[] },
    { towerId:'TT-003', pelaporId:ahmad!.id, jenisGangguan:'cui',                  deskripsi:'CUI pasca gangguan angin',                          levelRisiko:'rendah', status:'selesai',     tanggal:new Date('2025-04-20T09:00:00'), lokasiDetail:'Gajah Mada, Tangerang', teknisi:'Tim B — Hendra L.', temuan:'Tidak ada kerusakan signifikan', hasil:'Kondisi baik', noSpk:'SPK-2025-0390', foto:[] },
    // Cleanup
    { towerId:'TT-003', pelaporId:siti!.id,  jenisGangguan:'cleanup',              deskripsi:'Clean up isolator pasca hujan abu',                 levelRisiko:'rendah', status:'selesai',     tanggal:new Date('2025-04-15T07:00:00'), lokasiDetail:'Gajah Mada, Tangerang', teknisi:'Tim B — Hendra L.', noSpk:'SPK-2025-0370', foto:[] },
    { towerId:'SK-001', pelaporId:ahmad!.id, jenisGangguan:'cleanup',              deskripsi:'Pembersihan ROW dari vegetasi liar',                levelRisiko:'rendah', status:'menunggu',    tanggal:new Date('2025-05-05T07:00:00'), lokasiDetail:'Metland, Jakarta Barat', teknisi:'TBD', noSpk:'SPK-2025-0430', foto:[] },
  ]})

  await prisma.sertifikat.createMany({ skipDuplicates:true, data:[
    { towerId:'ST-003', tipe:'Kelayakan',   nama:'SLO Tower SUTET Balaraja',             berlakuHingga:new Date('2026-12-31'), status:'valid' },
    { towerId:'GI-002', tipe:'Grounding',   nama:'Uji Tahanan Pentanahan GIS Kembangan', berlakuHingga:new Date('2025-06-30'), status:'valid' },
    { towerId:'GI-004', tipe:'Konstruksi',  nama:'Izin Konstruksi GI Durikosambi',       berlakuHingga:new Date('2025-03-15'), status:'expired' },
    { towerId:'TT-001', tipe:'K3',          nama:'Sertifikat K3 Tower Lontar',           berlakuHingga:new Date('2027-01-01'), status:'valid' },
    { towerId:'GI-001', tipe:'Lingkungan',  nama:'AMDAL GIS Lontar',                     berlakuHingga:new Date('2026-10-20'), status:'valid' },
    { towerId:'ST-002', tipe:'K3',          nama:'Sertifikat K3 Tower Kembangan',        berlakuHingga:new Date('2024-12-31'), status:'expired' },
  ]})

  await prisma.asBuiltDrawing.createMany({ skipDuplicates:true, data:[
    { towerId:'ST-003', namaFile:'ABD-ST003-Balaraja-2023.pdf',    tipe:'Single Line Diagram', tahun:2023, versi:'v2.1' },
    { towerId:'GI-002', namaFile:'ABD-GI002-Kembangan-2022.pdf',   tipe:'Layout Plan',         tahun:2022, versi:'v1.0' },
    { towerId:'GI-004', namaFile:'ABD-GI004-Durikosambi-2024.pdf', tipe:'Foundation Drawing',  tahun:2024, versi:'v1.3' },
    { towerId:'TT-001', namaFile:'ABD-TT001-Lontar-2021.pdf',      tipe:'Tower Assembly',      tahun:2021, versi:'v2.0' },
  ]})

  console.log('Seed selesai!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
