-- DropForeignKey
ALTER TABLE "Chats" DROP CONSTRAINT "Chats_createdBy_fkey";

-- AlterTable
ALTER TABLE "Chats" ALTER COLUMN "createdBy" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "Chats" ADD CONSTRAINT "Chats_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
