-- Add jalur and nomorUrut fields to Tower table for polyline grouping
ALTER TABLE "Tower" ADD COLUMN IF NOT EXISTS "jalur" TEXT;
ALTER TABLE "Tower" ADD COLUMN IF NOT EXISTS "nomorUrut" INTEGER;
