import express from "express";
import { redisClient } from "../../services/redis";
import prismaClient from "../../db/db";

interface Message {
  chatId: number;
  //TODO
  // senderId: userID,
  text: string;
  timestamp: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  password: string;
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

  //fetch top 50 messages for the chatIds of user
  const result: ChatMessagesMap = {};

  for (const chatId of chatsData) {    
    // const messages = await getMessagesForChat(chatId); // existing function
    // result[chatId] = messages;
    //Store them in Redis if not already present [check before inserting]
  }
  res.send(roomIds);
  } catch (err) {
    res.status(500).send("Internal server error");
    console.error(`Failed to return roomIds: `, err);
  }
});

export default router;
