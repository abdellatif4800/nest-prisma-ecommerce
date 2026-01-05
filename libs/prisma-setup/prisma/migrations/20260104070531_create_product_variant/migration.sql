/*
  Warnings:

  - You are about to drop the column `productId` on the `CartItems` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `OrderItems` table. All the data in the column will be lost.
  - You are about to drop the column `colors` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `sizes` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `stock` on the `Product` table. All the data in the column will be lost.
  - Added the required column `variantId` to the `CartItems` table without a default value. This is not possible if the table is not empty.
  - Added the required column `variantId` to the `OrderItems` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CartItems" DROP CONSTRAINT "CartItems_productId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItems" DROP CONSTRAINT "OrderItems_productId_fkey";

-- AlterTable
ALTER TABLE "CartItems" DROP COLUMN "productId",
ADD COLUMN     "variantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "OrderItems" DROP COLUMN "productId",
ADD COLUMN     "variantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "colors",
DROP COLUMN "sizes",
DROP COLUMN "stock";

-- CreateTable
CREATE TABLE "ProductVariant" (
    "id" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "stock" INTEGER NOT NULL,
    "price" DOUBLE PRECISION,
    "productId" TEXT NOT NULL,

    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_productId_color_size_key" ON "ProductVariant"("productId", "color", "size");

-- AddForeignKey
ALTER TABLE "CartItems" ADD CONSTRAINT "CartItems_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItems" ADD CONSTRAINT "OrderItems_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
