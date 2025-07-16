import express from "express";
import session from "express-session";
import cors from "cors";
import http from "http";
import { setupWebsocket } from "./services/websocket";
import "./auth/passport-auth";
import passport from "passport";
import dashboardRoutes from "./routes/dashboard/dashboard";
import authRoutes from "./routes/auth/auth";
import {startMessageConsumer} from "./services/kafka"

const app = express();

app.use(express.json());
// app.use(cors());
app.use(
  cors({
    origin: "http://localhost:5173", // frontend URL
    credentials: true,               // allow cookies
  })
);

app.use(
  session({
    secret: "mysecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,         // set to true with HTTPS
      sameSite: "lax",       // or "none" with HTTPS and secure:true
    },
  })
);

// app.use(
//   session({ secret: "mysecret", resave: false, saveUninitialized: true })
// );

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
    successRedirect: "http://localhost:5173/dashboard",
    // successRedirect: "/api/auth/protected",
    // failureRedirect: "/auth/google/failure",
    failureRedirect: "http://localhost:5173/login",
    failureMessage: true,
  }),
  (req, res) => {
    res.send("You are successfully authenticated with Google!");
  }
);

const server = http.createServer(app);

// WebSocket server on the same HTTP server
setupWebsocket(server);
startMessageConsumer();

server.listen(8000, () => {
  console.log("Server running on port 8000");
});
