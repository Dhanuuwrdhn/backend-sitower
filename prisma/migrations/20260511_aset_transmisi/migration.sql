-- ============================================================
-- ASET TRANSMISI: hapus data staging, buat tabel baru, extend Tower
-- ============================================================

-- 1. Hapus semua data staging (CASCADE handles FK dependencies)
TRUNCATE "AsBuiltDokumen" CASCADE;
TRUNCATE "AsBuiltFolder" CASCADE;
TRUNCATE "AsBuiltDrawing" CASCADE;
TRUNCATE "SertifikatDokumen" CASCADE;
TRUNCATE "Sertifikat" CASCADE;
TRUNCATE "PasswordChangeRequest" CASCADE;
TRUNCATE "Laporan" CASCADE;
TRUNCATE "Tower" CASCADE;
TRUNCATE "JalurKML" RESTART IDENTITY CASCADE;

-- 2. Create TransmissionLineType
CREATE TABLE IF NOT EXISTS "TransmissionLineType" (
    "id"        SERIAL          NOT NULL,
    "kode"      TEXT            NOT NULL,
    "tegangan"  TEXT            NOT NULL,
    "warna"     TEXT            NOT NULL,
    "lineStyle" TEXT            NOT NULL DEFAULT 'solid',
    "createdAt" TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TransmissionLineType_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "TransmissionLineType_kode_key" ON "TransmissionLineType"("kode");

-- 3. Create GarduInduk
CREATE TABLE IF NOT EXISTS "GarduInduk" (
    "id"        SERIAL          NOT NULL,
    "kode"      TEXT            NOT NULL,
    "nama"      TEXT            NOT NULL,
    "lat"       DOUBLE PRECISION NOT NULL,
    "lng"       DOUBLE PRECISION NOT NULL,
    "tegangan"  TEXT            NOT NULL,
    "createdAt" TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GarduInduk_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "GarduInduk_kode_key" ON "GarduInduk"("kode");

-- 4. Create TransmissionRoute
CREATE TABLE IF NOT EXISTS "TransmissionRoute" (
    "id"          SERIAL          NOT NULL,
    "nama"        TEXT            NOT NULL,
    "lineTypeId"  INTEGER         NOT NULL,
    "garduDariId" INTEGER         NOT NULL,
    "garduKeId"   INTEGER         NOT NULL,
    "createdAt"   TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TransmissionRoute_pkey"         PRIMARY KEY ("id"),
    CONSTRAINT "TransmissionRoute_lineTypeId_fkey"  FOREIGN KEY ("lineTypeId")  REFERENCES "TransmissionLineType"("id"),
    CONSTRAINT "TransmissionRoute_garduDariId_fkey" FOREIGN KEY ("garduDariId") REFERENCES "GarduInduk"("id"),
    CONSTRAINT "TransmissionRoute_garduKeId_fkey"   FOREIGN KEY ("garduKeId")   REFERENCES "GarduInduk"("id")
);

-- 5. Extend Tower with new aset fields
ALTER TABLE "Tower" ADD COLUMN IF NOT EXISTS "routeId"         INTEGER;
ALTER TABLE "Tower" ADD COLUMN IF NOT EXISTS "statusKerawanan" TEXT NOT NULL DEFAULT 'aman';
ALTER TABLE "Tower" ADD COLUMN IF NOT EXISTS "jenisKerawanan"  TEXT;
ALTER TABLE "Tower" ADD COLUMN IF NOT EXISTS "pplNotes"        TEXT;
ALTER TABLE "Tower" ADD COLUMN IF NOT EXISTS "penanggungJawab" TEXT;
ALTER TABLE "Tower" ADD COLUMN IF NOT EXISTS "telepon"         TEXT;
ALTER TABLE "Tower" ADD COLUMN IF NOT EXISTS "sertifikatLink"  TEXT;

-- FK Tower → TransmissionRoute (add only if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Tower_routeId_fkey'
  ) THEN
    ALTER TABLE "Tower"
      ADD CONSTRAINT "Tower_routeId_fkey"
      FOREIGN KEY ("routeId") REFERENCES "TransmissionRoute"("id") ON DELETE SET NULL;
  END IF;
END $$;
