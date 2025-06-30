import { WebSocketServer, WebSocket } from "ws";
import type { Server as HTTPServer, Server } from "http";
require("dotenv").config();
import Redis from "ioredis";
import { produceMessage } from "./kafka";
import { redisClient } from "./redis";

interface Message {
  chatId: number;
  //TODO
  // senderId: userID,
  text: string;
  timestamp: number;
}

interface Connections {
  roomId: string;
  socket: WebSocket;
}

const pub = new Redis({
  host: process.env.REDIS_HOST,
  port: 13073,
  username: "default",
  password: process.env.REDIS_PASSWORD,
});

const sub = new Redis({
  host: process.env.REDIS_HOST,
  port: 13073,
  username: "default",
  password: process.env.REDIS_PASSWORD,
});

let UserConnections: Connections[] = [];
sub.subscribe("CHATS");

export async function sendMessageToRedis(chatId: string, message: Message) {
  const redisKey = `chat:recent:${chatId}`;
  const messageJson = JSON.stringify(message);

  try {
    const pipeline = redisClient.pipeline();

    pipeline.lpush(redisKey, messageJson);
    pipeline.ltrim(redisKey, 0, 49);

    await pipeline.exec();
  } catch (err) {
    console.error(`Failed to save recent message for chat ${chatId}:`, err);
  }
}

export function setupWebsocket(server: Server) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (socket) => {
    socket.on("message", async (data: any) => {
      try {
        //send the message to redis

        const ParsedData = JSON.parse(data); //data [type, payload] and payload has roomId
        const type = ParsedData.type;
        const roomID = ParsedData.payload.roomId;
        const email = ParsedData.payload.email;

        //join a room
        if (type == "join") {
          UserConnections.push({ roomId: ParsedData.payload.roomId, socket });
          // Add this mapping to KAFKA and then to DB
          //TODO => Add this entry in ChatUserMapping table [userEmail, RoomId]
        }

        //chat after joining a room
        if (type == "chat") {
          const chatId = ParsedData.payload.roomId;
          await pub.publish("CHATS", data);

          //add this to redis
          const newMessage: Message = {
            chatId,
            //TODO
            // senderId: userID,
            text: ParsedData.payload.message,
            timestamp: Date.now(),
          };

          //also send msg to Kafka or DB
          //TODO => Also add userId with this message
          await produceMessage(JSON.stringify(newMessage));

          await sendMessageToRedis(chatId, newMessage);
          console.log("Message produced to Redis and kafka broker");
        }
      } catch (err) {
        socket.send("Message format is incorrect");
      }
    });

    //disconnect
    socket.on("disconnect", () => {
      UserConnections.filter((conn) => conn.socket != socket);
    });
  });

  sub.on("message", async (channel, data) => {
    if (channel === "CHATS") {
      try {
        const ParsedData = JSON.parse(data); //[type, payload = {roomId, message}]
        const type = ParsedData.type;
        const roomID = ParsedData.payload.roomId;

        if (type == "chat") {
          // Send to all sockets on this server in the same roomId
          UserConnections.forEach((conn) => {
            if (
              conn.roomId === roomID &&
              conn.socket.readyState === WebSocket.OPEN
            ) {
              conn.socket.send(ParsedData.payload.message);
            }
          });
        }
      } catch (err) {
        console.error("Error processing Redis message:", err);
      }
    }
  });
}
