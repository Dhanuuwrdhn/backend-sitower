-- Unit table for managing organizational units
CREATE TABLE IF NOT EXISTS "Unit" (
  "id" TEXT NOT NULL,
  "nama" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Unit_nama_key" ON "Unit"("nama");

-- Seed initial units (only insert if table is empty)
INSERT INTO "Unit" ("id", "nama", "createdAt", "updatedAt")
SELECT 'unit-upt-durikosambi', 'UPT Durikosambi', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "Unit" WHERE "nama" = 'UPT Durikosambi');

INSERT INTO "Unit" ("id", "nama", "createdAt", "updatedAt")
SELECT 'unit-ultg-durikosambi', 'ULTG Durikosambi', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "Unit" WHERE "nama" = 'ULTG Durikosambi');
