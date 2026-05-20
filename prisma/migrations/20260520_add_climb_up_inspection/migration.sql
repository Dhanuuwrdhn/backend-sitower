-- ClimbUpInspection table (CUI revised — penghantar via tower, simple status enum)
CREATE TABLE IF NOT EXISTS "ClimbUpInspection" (
  "id" TEXT NOT NULL,
  "towerId" TEXT NOT NULL,
  "tanggal" TIMESTAMP(3) NOT NULL,
  "keterangan" TEXT,
  "status" TEXT NOT NULL DEFAULT 'sedang_berlangsung',
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ClimbUpInspection_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ClimbUpInspection_towerId_idx" ON "ClimbUpInspection"("towerId");
CREATE INDEX IF NOT EXISTS "ClimbUpInspection_createdById_idx" ON "ClimbUpInspection"("createdById");
CREATE INDEX IF NOT EXISTS "ClimbUpInspection_tanggal_idx" ON "ClimbUpInspection"("tanggal");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ClimbUpInspection_towerId_fkey'
  ) THEN
    ALTER TABLE "ClimbUpInspection"
      ADD CONSTRAINT "ClimbUpInspection_towerId_fkey"
      FOREIGN KEY ("towerId") REFERENCES "Tower"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ClimbUpInspection_createdById_fkey'
  ) THEN
    ALTER TABLE "ClimbUpInspection"
      ADD CONSTRAINT "ClimbUpInspection_createdById_fkey"
      FOREIGN KEY ("createdById") REFERENCES "Pegawai"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;
