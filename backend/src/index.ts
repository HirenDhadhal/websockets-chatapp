import express from "express";
import cors from "cors";
import http from "http";
import { setupWebsocket } from "./services/websocket";

const app = express();

app.use(express.json());
app.use(cors());

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from Express!' });
});

const server = http.createServer(app);

// Setup WebSocket server using the same HTTP server
setupWebsocket(server);

server.listen(8000, () => {
  console.log("Server running on http://localhost:8000");
});
