import express from "express";
import { redisClient } from "../../services/redis";

interface Message {
  chatId: number;
  //TODO
  // senderId: userID,
  text: string;
  timestamp: number;
}

type ChatMessagesMap = Record<number, Message[]>;

const router = express.Router();
export async function getMessagesForChat(chatId: number): Promise<any[]> {
  const redisKey = `chat:recent:${chatId}`;

  try {
    const messageStrings = await redisClient.lrange(redisKey, 0, 49);
    const messages = messageStrings
      .map((msg) => {
        try {
          return JSON.parse(msg);
        } catch {
          return null; // handle malformed messages
        }
      })
      .filter(Boolean); // remove nulls

    return messages;
  } catch (err) {
    console.error(`Failed to fetch recent messages for chat ${chatId}:`, err);
    return [];
  }
}

router.get("/", async () => {
  //fetch all the chatIds for logged in User from DB
  const chatsIds: number[] = [];

  //fetch top 50 messages for the chatIds of user
  const result: ChatMessagesMap = {};

  for (const chatId of chatsIds) {
    const messages = await getMessagesForChat(chatId); // existing function
    result[chatId] = messages;
  }
});

export default router;
