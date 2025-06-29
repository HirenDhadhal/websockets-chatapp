import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import prismaClient from "../db/db";

require("dotenv").config();

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
      callbackURL: "http://localhost:8000/google/callback",
    },

    // @ts-ignore
    async (accessToken, refreshToken, profile, done) => {
      
      try {
        let user = await prismaClient.user.findFirst({
          where: { email: profile.emails[0].value },
        });

        if (!user && profile.emails && profile.emails.length) {
          user = await prismaClient.user.findFirst({
            where: { email: profile.emails[0].value },
          });
        }

        if (!user) {
          user = await prismaClient.user.create({
            data: {
              name: profile.displayName,
              email: profile.emails?.[0]?.value ?? "",
              password: "",
            },
          });
        }

        return done(null, user);
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
