import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
require("dotenv").config();
import Redis from "ioredis";
import { produceMessage } from "./kafka";
import { redisClient } from "./redis";

interface Message {
  chatId: number;
  email: string;
  text: string;
  timestamp: string;
}

interface Connections {
  roomId: number;
  socket: WebSocket;
  email: string;
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

export async function sendMessageToRedis(chatId: number, message: Message) {
  const redisKey = `chat:recent:${chatId}`;
  const messageJson = JSON.stringify(message);

  try {
    const pipeline = redisClient.pipeline();

    pipeline.lpush(redisKey, messageJson);
    pipeline.ltrim(redisKey, 0, 49);

    await pipeline.exec();
  } catch (err) {
    console.error(`Failed to save recent message for chatId ${chatId}:`, err);
  }
}

export function setupWebsocket(server: Server) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (socket) => {
    socket.on("message", async (data: any) => {
      try {
        const ParsedData = JSON.parse(data);
        const type: string = ParsedData.type;
        const roomID: number = ParsedData.payload.roomId;
        const email: string = ParsedData.payload.email;

        //join a room
        if (type === "join") {
          UserConnections.push({ roomId: roomID, socket, email });

          // Add this User-RoomId mapping to KAFKA and then to DB
          try {
            await produceMessage(
              JSON.stringify({
                type: type,
                payload: {
                  chatId: roomID,
                  userEmail: email,
                },
              })
            );
          } catch (err) {
            console.error("failure in produce message: " + err);
          }
        } else if (type === "asktojoin") {
          //find the socket associated to userEmail, if present add entry in UserConnections
          //no need to push this mapping to Kafka & DB [already done in API route]
          
          for (const connection of UserConnections) {
            if (connection.email === email) {
              UserConnections.push({
                roomId: roomID,
                socket: connection.socket,
                email,
              });
              break;
            }
          }
        } else if (type === "rejoin") {
          UserConnections.push({ roomId: roomID, socket, email });
        } else if (type === "chat") {
          //Passing TimeStamp as String instead of BigInt
          const newMessage: Message = {
            chatId: roomID,
            email: email,
            text: ParsedData.payload.message,
            timestamp: Date.now().toString(),
          };

          //publish the message to Redis
          await pub.publish("CHATS", data);

          //also send msg to Kafka or DB
          await produceMessage(
            JSON.stringify({
              type: type,
              payload: newMessage,
            })
          );

          //storing the last 50 messages for each chatId
          await sendMessageToRedis(roomID, newMessage);
        }
      } catch (err) {
        socket.send("Error in sending the message");
        console.error("Error in processing the message to Redis/Kafka");
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
        const ParsedData = JSON.parse(data); //[type, payload = {roomId, email, message}]
        const type: string = ParsedData.type;
        const roomID: number = ParsedData.payload.roomId;
        const email: string = ParsedData.payload.email;
        const timestamp = Date.now().toString();

        if (type == "chat") {
          // Find all sockets for on this server in the same roomId and send message to them          
          UserConnections.forEach((conn) => {  
            if (
              conn.roomId === roomID &&
              conn.socket.readyState === WebSocket.OPEN
            ) {
              const messageToSend = JSON.stringify({message: ParsedData.payload.message, email, chatId: roomID, timestamp})
              conn.socket.send(messageToSend);
            }
          });
        }
      } catch (err) {
        console.error("Error processing Redis message:", err);
      }
    }
  });
}
