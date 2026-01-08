/*
  Warnings:

  - You are about to drop the column `price` on the `OrderItems` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[orderId,variantId]` on the table `OrderItems` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `snapshotPrice` to the `OrderItems` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OrderItems" DROP COLUMN "price",
ADD COLUMN     "snapshotPrice" DOUBLE PRECISION NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "OrderItems_orderId_variantId_key" ON "OrderItems"("orderId", "variantId");
