import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import prismaClient from "../db/db";

require("dotenv").config();
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

var GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const user = await prismaClient.user.findFirst({ where: { email } });

        if (!user || !user.password) {
          return done(null, false, { message: "Invalid email or password" });
        }

        const ok = await bcrypt.compare(password, user.password);
        if (!ok)
          return done(null, false, { message: "Invalid email or password" });

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${BACKEND_URL}/google/callback`,
    },

    // @ts-ignore
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await prismaClient.user.upsert({
          create: {
            email: profile.emails[0].value,
            name: profile.displayName,
            password: "",
            image: profile.photos?.[0]?.value ?? null,
          },
          update: {
            name: profile.displayName,
            image: profile.photos?.[0]?.value ?? null,
          },
          where: {
            email: profile.emails[0].value,
          },
        });

        console.log(user);
        done(null, user);
      } catch (err) {
        return done(err as Error);
      }
    }
  )
);

passport.serializeUser((user: any, done) => done(null, user.id));
passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await prismaClient.user.findUnique({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err);
  }
});
