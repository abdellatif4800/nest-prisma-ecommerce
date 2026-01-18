/*
  Warnings:

  - Added the required column `arriveAt` to the `Orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Cart" ADD COLUMN     "total" DECIMAL(65,30) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Orders" ADD COLUMN     "arriveAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "paymentIntentId" TEXT,
ADD COLUMN     "paymentStatus" TEXT DEFAULT 'pending';
