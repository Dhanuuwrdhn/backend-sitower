-- Add radius field to Tower table (in meters, default 100m)
ALTER TABLE "Tower" ADD COLUMN IF NOT EXISTS "radius" DOUBLE PRECISION NOT NULL DEFAULT 100;
