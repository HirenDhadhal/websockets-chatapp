/*
  Warnings:

  - A unique constraint covering the columns `[userEmail,chatId]` on the table `ChatUserMapping` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ChatUserMapping_userEmail_chatId_key" ON "ChatUserMapping"("userEmail", "chatId");
