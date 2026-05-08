/*
  Warnings:

  - You are about to drop the column `kategori` on the `Laporan` table. All the data in the column will be lost.
  - You are about to drop the column `level` on the `Laporan` table. All the data in the column will be lost.
  - You are about to drop the column `lokasi` on the `Laporan` table. All the data in the column will be lost.
  - Added the required column `jenisGangguan` to the `Laporan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `levelRisiko` to the `Laporan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Laporan" DROP COLUMN "kategori",
DROP COLUMN "level",
DROP COLUMN "lokasi",
ADD COLUMN     "jenisGangguan" TEXT NOT NULL,
ADD COLUMN     "levelRisiko" TEXT NOT NULL,
ADD COLUMN     "lokasiDetail" TEXT;
