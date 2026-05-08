-- CreateTable
CREATE TABLE "Pegawai" (
    "id" TEXT NOT NULL,
    "nik" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "jabatan" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'teknisi',
    "password" TEXT NOT NULL,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "foto" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pegawai_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tower" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "tegangan" TEXT NOT NULL,
    "tipe" TEXT NOT NULL,
    "kondisi" TEXT NOT NULL DEFAULT 'normal',
    "lokasi" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tower_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Laporan" (
    "id" TEXT NOT NULL,
    "towerId" TEXT NOT NULL,
    "pelaporId" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'berlangsung',
    "tanggal" TIMESTAMP(3) NOT NULL,
    "lokasi" TEXT,
    "keterangan" TEXT,
    "foto" TEXT[],
    "noSpk" TEXT,
    "teknisi" TEXT,
    "temuan" TEXT,
    "hasil" TEXT,
    "penyebab" TEXT,
    "durasi" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Laporan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sertifikat" (
    "id" TEXT NOT NULL,
    "towerId" TEXT NOT NULL,
    "tipe" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "berlakuHingga" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "fileUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sertifikat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AsBuiltDrawing" (
    "id" TEXT NOT NULL,
    "towerId" TEXT NOT NULL,
    "namaFile" TEXT NOT NULL,
    "tipe" TEXT NOT NULL,
    "tahun" INTEGER NOT NULL,
    "versi" TEXT,
    "fileUrl" TEXT,
    "keterangan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AsBuiltDrawing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pegawai_nik_key" ON "Pegawai"("nik");

-- AddForeignKey
ALTER TABLE "Laporan" ADD CONSTRAINT "Laporan_towerId_fkey" FOREIGN KEY ("towerId") REFERENCES "Tower"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Laporan" ADD CONSTRAINT "Laporan_pelaporId_fkey" FOREIGN KEY ("pelaporId") REFERENCES "Pegawai"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sertifikat" ADD CONSTRAINT "Sertifikat_towerId_fkey" FOREIGN KEY ("towerId") REFERENCES "Tower"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AsBuiltDrawing" ADD CONSTRAINT "AsBuiltDrawing_towerId_fkey" FOREIGN KEY ("towerId") REFERENCES "Tower"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
