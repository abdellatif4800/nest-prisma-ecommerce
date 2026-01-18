/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `ProductVariant` table. All the data in the column will be lost.
  - Made the column `arriveAt` on table `Orders` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Orders" ALTER COLUMN "arriveAt" SET NOT NULL;

-- AlterTable
ALTER TABLE "ProductVariant" DROP COLUMN "imageUrl",
ADD COLUMN     "imageFileName" TEXT;
