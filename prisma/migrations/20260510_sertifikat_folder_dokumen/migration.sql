-- AlterTable: Sertifikat — drop old columns, add new ones, make towerId optional
ALTER TABLE "Sertifikat" DROP CONSTRAINT IF EXISTS "Sertifikat_towerId_fkey";

ALTER TABLE "Sertifikat"
  ADD COLUMN IF NOT EXISTS "kategori" TEXT,
  ALTER COLUMN "towerId" DROP NOT NULL,
  ALTER COLUMN "berlakuHingga" DROP NOT NULL,
  ALTER COLUMN "status" SET DEFAULT 'berlaku';

-- Copy tipe → kategori for existing rows, then drop tipe
UPDATE "Sertifikat" SET "kategori" = "tipe" WHERE "kategori" IS NULL;
ALTER TABLE "Sertifikat" ALTER COLUMN "kategori" SET NOT NULL;

ALTER TABLE "Sertifikat"
  DROP COLUMN IF EXISTS "tipe",
  DROP COLUMN IF EXISTS "fileUrl";

-- Re-add FK as optional
ALTER TABLE "Sertifikat"
  ADD CONSTRAINT "Sertifikat_towerId_fkey"
  FOREIGN KEY ("towerId") REFERENCES "Tower"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable: SertifikatDokumen
CREATE TABLE IF NOT EXISTS "SertifikatDokumen" (
  "id"        TEXT NOT NULL,
  "folderId"  TEXT NOT NULL,
  "namaFile"  TEXT NOT NULL,
  "fileUrl"   TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SertifikatDokumen_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "SertifikatDokumen"
  ADD CONSTRAINT "SertifikatDokumen_folderId_fkey"
  FOREIGN KEY ("folderId") REFERENCES "Sertifikat"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
