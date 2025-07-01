/*
  Warnings:

  - You are about to drop the column `userId` on the `ChatUserMapping` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userEmail` to the `ChatUserMapping` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ChatUserMapping" DROP COLUMN "userId",
ADD COLUMN     "userEmail" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
