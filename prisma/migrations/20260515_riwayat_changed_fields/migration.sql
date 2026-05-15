-- Add changedFields column to RiwayatLaporan to record which fields were
-- actually modified in each "Perbarui Laporan" submission.
ALTER TABLE "RiwayatLaporan"
  ADD COLUMN IF NOT EXISTS "changedFields" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
