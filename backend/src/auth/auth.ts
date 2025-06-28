import passport from "passport";
require('dotenv').config();

var GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:8000/google/callback",
    },

    //@ts-ignore
    function (accessToken, refreshToken, profile, cb) {
      //find or create user in DB
      return cb(null, profile);
    }
  )
);

passport.serializeUser(function (user, done) {
  return done(null, user);
});

passport.deserializeUser(function (user, done) {
    //@ts-ignore
  return done(null, user);
});
