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

export async function addUsersToChat(chatId: number, userEmails: string[]) {
  // Keep all entries in single transaction [all users assigned a room or none]
  const operations = userEmails.map((email) =>
    prismaClient.chatUserMapping.create({
      data: {
        userEmail: email,
        chatId: chatId,
      },
    })
  );

  await prismaClient.$transaction(operations);
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

    res.status(200).json(roomIds);
  } catch (err) {
    res.status(500).json({error: "Internal server error"});
    console.error(`Failed to return roomIds: `, err);
  }
});

router.post("/create-new-chat", async (req, res) => {
  const userEmails: string[] = req.body.emails;

  console.log('User Email received in backend for new chat:');
  console.log(userEmails);

  try {
    const data = await prismaClient.chatUserMapping.findFirst({
      select: { chatId: true },
      orderBy: { chatId: "desc" },
    });

    const maxRoomId = data?.chatId;
    const newChatId = (maxRoomId ? maxRoomId : 1) + 1;
    

    //Add user-RoomId mapping to DB
    await addUsersToChat(newChatId, userEmails);
    
    res.status(200).json({ chatId: newChatId });
  } catch (err) {
    console.error("Error creating new chat or adding users in Chat:", err);
    res.status(500).json({ error: "Failed to create chat" });
  }
});


router.post('/add-new-users', async (req, res) => {
  const chatId = req.body.chatId;
  const userEmails: string[] = req.body.userEmails;

  try {
    await addUsersToChat(chatId, userEmails);

    res.status(200).json({ message: "Successfully added users to chat"});
  } catch (err) {
    console.error(`Error adding new user to ChatId-${chatId}: ` + err);
    res.status(500).json({ error: "Failed to add users to chat" });
  }
})

export default router;
