-- AsBuiltFolder: nested + uploader
ALTER TABLE "AsBuiltFolder"
  ADD COLUMN IF NOT EXISTS "parentId" TEXT,
  ADD COLUMN IF NOT EXISTS "createdById" TEXT;

DO $$ BEGIN
  ALTER TABLE "AsBuiltFolder"
    ADD CONSTRAINT "AsBuiltFolder_parentId_fkey"
    FOREIGN KEY ("parentId") REFERENCES "AsBuiltFolder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "AsBuiltFolder"
    ADD CONSTRAINT "AsBuiltFolder_createdById_fkey"
    FOREIGN KEY ("createdById") REFERENCES "Pegawai"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- AsBuiltDokumen: root files + uploader
ALTER TABLE "AsBuiltDokumen"
  ADD COLUMN IF NOT EXISTS "createdById" TEXT,
  ALTER COLUMN "folderId" DROP NOT NULL;

DO $$ BEGIN
  ALTER TABLE "AsBuiltDokumen"
    ADD CONSTRAINT "AsBuiltDokumen_createdById_fkey"
    FOREIGN KEY ("createdById") REFERENCES "Pegawai"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
