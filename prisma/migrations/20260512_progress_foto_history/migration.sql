CREATE TABLE "ProgressLaporan" (
    "id"        TEXT NOT NULL,
    "laporanId" TEXT NOT NULL,
    "tipe"      TEXT NOT NULL,
    "fileUrl"   TEXT NOT NULL,
    "namaFile"  TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProgressLaporan_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FotoHistory" (
    "id"        TEXT NOT NULL,
    "laporanId" TEXT NOT NULL,
    "urls"      TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FotoHistory_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ProgressLaporan" ADD CONSTRAINT "ProgressLaporan_laporanId_fkey"
    FOREIGN KEY ("laporanId") REFERENCES "Laporan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "FotoHistory" ADD CONSTRAINT "FotoHistory_laporanId_fkey"
    FOREIGN KEY ("laporanId") REFERENCES "Laporan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
