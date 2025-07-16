import express from "express";
import { redisClient } from "../../services/redis";
import prismaClient from "../../db/db";

interface Message {
  email: string;
  text: string;
  // timestamp: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

type ChatMessagesMap = Record<number, Message[]>;

const router = express.Router();

export async function getMessagesForChat(
  chatIdsArray: number[]
): Promise<Record<number, Message[]>> {
  const result: Record<number, Message[]> = {};

  try {
    for (const chatid of chatIdsArray) {
      const redisKey = `chat:recent:${chatid}`;
      const messageStrings = await redisClient.lrange(redisKey, 0, 49);

      let messages: Message[] = messageStrings
        .map((msg) => {
          try {
            const parsedData = JSON.parse(msg);
            const email = parsedData.payload.email;
            const text = parsedData.payload.message;
            return { email, text };
          } catch {
            return null;
          }
        })
        .filter(Boolean) as Message[];

      if (messages.length === 0) {
        const messageData = await prismaClient.chatMessages.findMany({
          where: { ChatId: chatid },
          orderBy: { sentAt: "desc" },
          take: 30,
        });

        messages = messageData
          .map((msg) => {
            try {
              return { email: msg.userEmail, text: msg.text };
            } catch {
              return null;
            }
          })
          .filter(Boolean) as Message[];
      }

      result[chatid] = messages;
    }

    return result;
  } catch (err) {
    console.error(`Failed to fetch messages:`, err);
    return {};
  }
}

router.get("/roomids-per-user", async (req, res) => {
  //fetch all the chatIds for logged in User from DB
  try {
    const user = req.user as User;

    let chatsData = await prismaClient.chatUserMapping.findMany({
      where: {
        userEmail: user.email,
      },
      select: {
        chatId: true,
      },
    });
    const roomIds: number[] = chatsData.map((chat) => chat.chatId);

    const messages = await getMessagesForChat(roomIds);
    //TODO => Store them in Redis if not already present [check before inserting]

    res.send(messages);
  } catch (err) {
    res.status(500).send("Internal server error");
    console.error(`Failed to return roomIds: `, err);
  }
});

export default router;
