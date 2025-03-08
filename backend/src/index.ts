import { WebSocketServer, WebSocket } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

interface Connections {
  roomId: string;
  socket: WebSocket;
}
let UserConnections: Connections[] = [];

wss.on('connection', (socket) => {
  //   UserConnections.push(socket);
  socket.on('message', (data: any) => {
    try {
      const ParsedData = JSON.parse(data); //data [type, payload] and payload has roomId
      const type = ParsedData.type;
      const roomID = ParsedData.payload.roomId;

      //join a room
      if (type == 'join') {
        UserConnections.push({ roomId: ParsedData.payload.roomId, socket });
        // socket.send('You have joined Room: ' + roomID);
      }

      //chat after joining a room
      if (type == 'chat') {
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
      socket.send('Message format is incorrect');
    }
  });

  //disconnect
  socket.on('disconnect', () => {
    UserConnections.filter((conn) => conn.socket != socket);
  });
});
