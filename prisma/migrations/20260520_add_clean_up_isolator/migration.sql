-- CleanUpIsolator table — penghantar via tower, sirkit enum, simple status enum
CREATE TABLE IF NOT EXISTS "CleanUpIsolator" (
  "id" TEXT NOT NULL,
  "towerId" TEXT NOT NULL,
  "sirkit" TEXT NOT NULL DEFAULT 'sirkit_1',
  "tanggal" TIMESTAMP(3) NOT NULL,
  "keterangan" TEXT,
  "status" TEXT NOT NULL DEFAULT 'sedang_berlangsung',
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CleanUpIsolator_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "CleanUpIsolator_towerId_idx" ON "CleanUpIsolator"("towerId");
CREATE INDEX IF NOT EXISTS "CleanUpIsolator_createdById_idx" ON "CleanUpIsolator"("createdById");
CREATE INDEX IF NOT EXISTS "CleanUpIsolator_tanggal_idx" ON "CleanUpIsolator"("tanggal");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'CleanUpIsolator_towerId_fkey'
  ) THEN
    ALTER TABLE "CleanUpIsolator"
      ADD CONSTRAINT "CleanUpIsolator_towerId_fkey"
      FOREIGN KEY ("towerId") REFERENCES "Tower"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'CleanUpIsolator_createdById_fkey'
  ) THEN
    ALTER TABLE "CleanUpIsolator"
      ADD CONSTRAINT "CleanUpIsolator_createdById_fkey"
      FOREIGN KEY ("createdById") REFERENCES "Pegawai"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;
