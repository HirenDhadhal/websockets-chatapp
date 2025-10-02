/*
  Warnings:

  - A unique constraint covering the columns `[chatId]` on the table `Chats` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Chats_chatId_key" ON "Chats"("chatId");
