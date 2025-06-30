import express, { Request, Response, NextFunction } from "express";
import passport from "passport";
import prismaClient from "../../db/db";
import bcrypt from "bcrypt";
import "../../auth/passport-auth";

const router = express.Router();

function isLoggedIn(req: Request, res: Response, next: NextFunction) {
  req.user ? next() : res.sendStatus(401);
}

//Google Login
router.get(
  "/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

router.get("/protected", isLoggedIn, (req, res) => {
  //@ts-ignore
  res.send(`Hello ${req.user?.email}`);
});

//SignUp
router.post("/signup", async (req, res): Promise<void> => {
  const { name, email, password } = req.body;
  try {
    if (!email || !password) {
      res.status(400).send("Missing fields");
      return;
    }

    const existing = await prismaClient.user.findFirst({ where: { email } });
    if (existing) {
      res.status(400).send("Email already in use");
      return;
    }

    const hash = await bcrypt.hash(password, 12);
    const user = await prismaClient.user.create({
      data: { name, email, password: hash },
    });
    (req as any).login(user, (err: any) => {
      if (err) return res.status(500).send("Login error");

      return res.send("User created successfully");
    });
  } catch (err) {
    res.status(500).send("Internal server error");
  }
});

//SignIn
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await prismaClient.user.findFirst({
      where: { email },
    });

    if (!existingUser || !existingUser.password) {
      res.status(404).send("User does not exist or use Google Sign-in");
      return;
    }

    const passwordMatch = await bcrypt.compare(password, existingUser.password);
    if (!passwordMatch) {
      res.status(401).send("Incorrect email or password");
      return;
    }

    (req as any).login(existingUser, (err: any) => {
      if (err) {
        res.status(500).send("Login failed");
        return;
      }

      return res.status(200).send("User signed in");
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

//SignOut
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy(() => {
      res.send("Goodbye!");
    });
  });
});

export default router;
