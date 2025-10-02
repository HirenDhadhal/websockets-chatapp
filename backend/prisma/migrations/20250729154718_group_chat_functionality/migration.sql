-- CreateTable
CREATE TABLE "Chats" (
    "id" SERIAL NOT NULL,
    "isGroup" BOOLEAN NOT NULL,
    "chatName" TEXT NOT NULL,
    "chatId" INTEGER NOT NULL,
    "createdAt" TEXT NOT NULL,
    "createdBy" INTEGER NOT NULL,

    CONSTRAINT "Chats_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Chats" ADD CONSTRAINT "Chats_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
