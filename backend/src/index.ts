import express from "express";
import session from "express-session";
import cors from "cors";
import http from "http";
import { setupWebsocket } from "./services/websocket";
import "./auth/auth";
import passport from "passport";
import dashboardRoutes from "./routes/dashboard/dashboard";
import authRoutes from "./routes/auth/auth";

const app = express();

app.use(express.json());
app.use(cors());

app.use(
  session({ secret: "mysecret", resave: false, saveUninitialized: true })
);
app.use(passport.initialize());
app.use(passport.session());

app.use("/api/dashboard", dashboardRoutes);
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send('<a href="/api/auth/google">Authenticate with Google</a>');
});

app.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: "/protected",
    failureRedirect: "/auth/google/failure",
    failureMessage: true,
  }),
  (req, res) => {
    res.send("You are successfully authenticated with Google!");
  }
);

const server = http.createServer(app);

// WebSocket server on the same HTTP server
setupWebsocket(server);

server.listen(8000, () => {
  console.log("Server running on port 8000");
});
