-- CreateTable AsBuiltFolder
CREATE TABLE IF NOT EXISTS "AsBuiltFolder" (
    "id"         TEXT NOT NULL,
    "nama"       TEXT NOT NULL,
    "tipe"       TEXT NOT NULL,
    "tahun"      INTEGER NOT NULL,
    "towerId"    TEXT,
    "keterangan" TEXT,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AsBuiltFolder_pkey" PRIMARY KEY ("id")
);

-- CreateTable AsBuiltDokumen
CREATE TABLE IF NOT EXISTS "AsBuiltDokumen" (
    "id"        TEXT NOT NULL,
    "folderId"  TEXT NOT NULL,
    "namaFile"  TEXT NOT NULL,
    "fileUrl"   TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AsBuiltDokumen_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey AsBuiltFolder.towerId → Tower
ALTER TABLE "AsBuiltFolder"
    ADD CONSTRAINT "AsBuiltFolder_towerId_fkey"
    FOREIGN KEY ("towerId") REFERENCES "Tower"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey AsBuiltDokumen.folderId → AsBuiltFolder (cascade delete)
ALTER TABLE "AsBuiltDokumen"
    ADD CONSTRAINT "AsBuiltDokumen_folderId_fkey"
    FOREIGN KEY ("folderId") REFERENCES "AsBuiltFolder"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
