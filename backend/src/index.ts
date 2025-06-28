import express from "express";
import { Request, Response, NextFunction } from "express";
import session from "express-session";
import cors from "cors";
import http from "http";
import { setupWebsocket } from "./services/websocket";
import "./auth/auth";
import passport from "passport";

const app = express();

app.use(express.json());
app.use(cors());

app.use(session({ secret: "cats", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

function isLoggedIn(req: Request, res: Response, next: NextFunction) {
  req.user ? next() : res.sendStatus(401);
}

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from Express!" });
});

app.get("/", (req, res) => {
  res.send('<a href="/auth/google">Authenticate with Google</a>');
});

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

app.get(
  "/google/callback",
    passport.authenticate( 'google', {
    successRedirect: '/protected',
    failureRedirect: '/auth/google/failure'
  }),
  (req, res) => {
    res.send("You are successfully authenticated with Google!");
  }
);

app.get('/protected', isLoggedIn, (req, res) => {
  //@ts-ignore
  res.send(`Hello ${req.user?.displayName}`);
  
});

app.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy(() => {
      res.send("Goodbye!");
    });
  });
});

const server = http.createServer(app);

// WebSocket server on the same HTTP server
setupWebsocket(server);

server.listen(8000, () => {
  console.log("Server running on port 8000");
});
