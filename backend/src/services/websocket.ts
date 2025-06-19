import { WebSocketServer, WebSocket } from "ws";
import type { Server as HTTPServer, Server } from "http";
require('dotenv').config();
import Redis from "ioredis";
import { produceMessage } from "./kafka";

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

interface Connections {
  roomId: string;
  socket: WebSocket;
}
let UserConnections: Connections[] = [];
sub.subscribe("CHATS");

export function setupWebsocket(server: Server) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (socket) => {
    socket.on("message", async (data: any) => {
      try {
        //send the message to redis

        const ParsedData = JSON.parse(data); //data [type, payload] and payload has roomId
        const type = ParsedData.type;
        const roomID = ParsedData.payload.roomId;

        //join a room
        if (type == "join") {
          UserConnections.push({ roomId: ParsedData.payload.roomId, socket });
          // socket.send('You have joined Room: ' + roomID);
        }

        //chat after joining a room
        if (type == "chat") {
          await pub.publish("CHATS", data);
          //also send msg to Kafka or DB
          //TODO => Also add userId and timestamp with this message
          await produceMessage(data);
          console.log('Message producer to kafka broker');
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
