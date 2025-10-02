import express from "express";
import { redisClient } from "../../services/redis";
import prismaClient from "../../db/db";

interface Message {
  email: string;
  text: string;
  timestamp: string;
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
      // await redisClient.del(redisKey);
      let messageStrings = await redisClient.lrange(redisKey, 0, 30);
      messageStrings = messageStrings.reverse();

      let messages: Message[] = messageStrings
        .map((msg) => {
          try {
            const parsedData = JSON.parse(msg);
            const email = parsedData.email;
            const text = parsedData.text;
            const timestamp = parsedData.timestamp;

            return { email, text, timestamp };
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

        const reversedMessages = messageData.reverse();
        //TODO => Then clear Redis Cache once to erase incorrect data

        messages = reversedMessages
          .map((msg) => {
            try {
              return {
                email: msg.userEmail,
                text: msg.text,
                timestamp: msg.sentAt,
              };
            } catch {
              return null;
            }
          })
          .filter(Boolean) as Message[];

        //TODO => Store them in Redis if not already present [check before inserting]
        if (messages.length > 0) {
          const redisKey = `chat:recent:${chatid}`;

          const pipeline = redisClient.pipeline();
          for (const msg of messages) {
            pipeline.lpush(redisKey, JSON.stringify(msg));
            pipeline.ltrim(redisKey, 0, 49);
          }

          await pipeline.exec();
        }
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
        userEmail: true,
      },
    });
    const roomIds: number[] = chatsData.map((chat) => chat.chatId);

    //fetch recent 30 messages for these roomIds
    const messages = await getMessagesForChat(roomIds);

    //Create RoomId-[userEmails] mapping => Record<number, string[]>
    const usersPerRoom: Record<number, string[]> = {};
    const chatUserMappings = await prismaClient.chatUserMapping.findMany({
      where: {
        chatId: { in: roomIds },
      },
      select: {
        chatId: true,
        userEmail: true,
      },
    });

    chatUserMappings.forEach(({ chatId, userEmail }) => {
      if (!usersPerRoom[chatId]) {
        usersPerRoom[chatId] = [];
      }
      usersPerRoom[chatId].push(userEmail);
    });

    const allUsers = await prismaClient.user.findMany({
      select: {
        name: true,
        email: true,
        id: true,
        image: true,
      },
    });

    const allUsersMapping: Record<
      string,
      { id: number; name: string; email: string; image: string }
    > = {};
    allUsers.forEach((user) => {
      allUsersMapping[user.email] = {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image || "",
      };
    });

    const groupChatData = await prismaClient.chats.findMany({
      where: {
        chatId: {
          in: roomIds,
        },
      },
    });

    res.status(200).json({
      roomIds,
      messages,
      allUsersMapping,
      groupChatData,
      usersPerRoom,
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
    console.error(`Failed to return roomIds: `, err);
  }
});

router.get("/:chatid/messages/before/:timestamp", async (req, res) => {
  const chatId: number = parseInt(req.params.chatid);
  const timestamp = req.params.timestamp;

  try {
    const olderChatMessages = await prismaClient.chatMessages.findMany({
      where: {
        ChatId: chatId,
        sentAt: {
          lt: timestamp,
        },
      },
      orderBy: {
        sentAt: "desc",
      },
      select: {
        text: true,
        sentAt: true,
        userEmail: true,
        //TODO: Add UserName as well
      },
      take: 30,
    });

    const reversedMessages = olderChatMessages.reverse();
    res.status(200).json(reversedMessages);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
    console.error(`Failed to fetch older Messages for roomId: `, err);
  }
});

router.post("/create-new-chat", async (req, res) => {
  const userEmails: string[] = req.body.emails;

  //@ts-ignore
  const currentUser: User = req.user;

  try {
    const data = await prismaClient.chatUserMapping.findFirst({
      select: { chatId: true },
      orderBy: { chatId: "desc" },
    });

    const maxRoomId = data?.chatId;
    const newChatId = (maxRoomId ? maxRoomId : 1) + 1;

    //Add user-RoomId mapping to DB
    await addUsersToChat(newChatId, userEmails);

    //Add entry in the Chats table
    const IsGroupChat = userEmails.length > 2 ? true : false;
    const newChatData = await prismaClient.chats.create({
      data: {
        isGroup: IsGroupChat,
        chatId: newChatId,
        chatName: req.body.groupChatName ? req.body.groupChatName : "",
        createdAt: Date.now().toString(),
        createdBy: currentUser.email,
      },
    });

    res.status(200).json({ chatId: newChatId, groupChatData: newChatData });
  } catch (err) {
    console.error("Error creating new chat or adding users in Chat:", err);
    res.status(500).json({ error: "Failed to create chat" });
  }
});

router.post("/add-new-users", async (req, res) => {
  const chatId = req.body.chatId;
  const userEmails: string[] = req.body.userEmails;

  try {
    await addUsersToChat(chatId, userEmails);

    //CLEAR the Redis Cache for ChatId
    const redisKey = `users:room:${chatId}`;

    const result = await redisClient.del(redisKey);

    if (result > 0) {
      console.log(`Cache cleared for roomId: ${chatId}`);
    } else {
      console.log(`No cache to clear for roomId: ${chatId}`);
    }

    res.status(200).json({ message: "Successfully added users to chat" });
  } catch (err) {
    console.error(`Error adding new user to ChatId-${chatId}: ` + err);
    res.status(500).json({ error: "Failed to add users to chat" });
  }
});

router.post("/fetch-users", async (req, res) => {
  const roomIds: number[] = req.body.roomIds;

  if (!Array.isArray(roomIds) || roomIds.length === 0) {
    res.status(400).json({ error: "roomIds must be a non-empty array" });
    return;
  }

  try {
    const usersByRoom: Record<number, string[]> = {};
    const missedRoomIds: number[] = [];

    //Check in Redis if the User object exists in redis for userEmail
    const redisKeys = roomIds.map((id) => `users:room:${id}`);
    const cachedResults = await redisClient.mget(redisKeys);

    cachedResults.forEach((result, index) => {
      const currentRoomId = roomIds[index];
      if (result) {
        usersByRoom[currentRoomId] = JSON.parse(result);
      } else {
        missedRoomIds.push(currentRoomId);
      }
    });

    //If not, fetch from DB and Cache in redis
    if (missedRoomIds.length > 0) {
      const userMappings = await prismaClient.chatUserMapping.findMany({
        where: {
          chatId: {
            in: missedRoomIds,
          },
        },
        select: {
          userEmail: true,
          chatId: true,
        },
      });

      userMappings.map((map) => {
        const email = map.userEmail;
        const roomId = map.chatId;

        if (!usersByRoom[roomId]) {
          usersByRoom[roomId] = [];
        }

        usersByRoom[roomId].push(email);
      });

      //Cache the newly fetched DB data back into Redis
      const redisPipeline = redisClient.pipeline();

      for (const roomId of missedRoomIds) {
        const emailsForRoom = usersByRoom[roomId];

        const redisKey = `users:room:${roomId}`;
        redisPipeline.set(redisKey, JSON.stringify(emailsForRoom));
      }

      // Execute all caching commands in a single operation
      await redisPipeline.exec();
    }

    res.status(200).json(usersByRoom);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Unable to fetch users for joined Chats" });
  }
});

router.post("/update-chat-name", async (req, res) => {
  //TODO => Update chatName in the Chats table for the chatId passed
  const chatId: number = parseInt(req.body.chatId);
  const newChatName: string = req.body.chatname;

  try {
    await prismaClient.chats.update({
      where: {
        chatId: chatId,
      },
      data: {
        chatName: newChatName,
      },
    });
  } catch (err) {
    console.error(err);
    res.send(500).json({ error: "Failed to update Chat Name" });
  }
});

export default router;
