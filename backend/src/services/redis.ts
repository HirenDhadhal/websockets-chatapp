import Redis from "ioredis";

const redisConfig = {
  host: process.env.REDIS_HOST,
  port: 13073,
  username: "default",
  password: process.env.REDIS_PASSWORD,
};

export const redis = new Redis(redisConfig);

export const redisClient = redis;
