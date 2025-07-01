/*
  Warnings:

  - You are about to drop the column `timestamp` on the `ChatMessages` table. All the data in the column will be lost.
  - Added the required column `sentAt` to the `ChatMessages` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ChatMessages" DROP COLUMN "timestamp",
ADD COLUMN     "sentAt" TEXT NOT NULL;
