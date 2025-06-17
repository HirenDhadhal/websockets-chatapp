import { WebSocketServer, WebSocket } from "ws";
import type { Server as HTTPServer, Server } from "http";
import Redis from "ioredis";

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
sub.subscribe("CHAT");

export function setupWebsocket(server: Server) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (socket) => {
    //   UserConnections.push(socket);
    socket.on("message", async (data: any) => {
      try {
        //send the message to redis
        await pub.publish("CHATS", data);

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
          const currentUserRoomID = UserConnections.find(
            (x) => x.socket === socket
          )?.roomId;

          UserConnections.map((conn) => {
            if (conn.roomId === currentUserRoomID) {
              conn.socket.send(ParsedData.payload.message);
            }
          });
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

  sub.on("message", async (channel, message) => {
    if(channel === 'CHATS'){
        //send the message to all the people in current roomId
    }
  })
}
