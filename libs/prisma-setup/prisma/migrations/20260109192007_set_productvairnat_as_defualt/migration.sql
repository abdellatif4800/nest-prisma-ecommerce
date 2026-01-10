/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `Product` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[defaultVariantId]` on the table `Product` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "imageUrl",
ADD COLUMN     "defaultVariantId" TEXT;

-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "publish" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Product_defaultVariantId_key" ON "Product"("defaultVariantId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_defaultVariantId_fkey" FOREIGN KEY ("defaultVariantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
