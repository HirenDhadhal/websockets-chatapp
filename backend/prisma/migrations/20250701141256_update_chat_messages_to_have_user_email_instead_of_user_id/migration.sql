/*
  Warnings:

  - You are about to drop the column `userId` on the `ChatMessages` table. All the data in the column will be lost.
  - Added the required column `userEmail` to the `ChatMessages` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ChatMessages" DROP COLUMN "userId",
ADD COLUMN     "userEmail" TEXT NOT NULL;
