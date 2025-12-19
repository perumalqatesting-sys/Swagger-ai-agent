import { Request, Response, NextFunction } from "express";

export default function rateLimiter() {
  // If REDIS_URL is configured, attempt to use Redis-backed store.
  const rateLimit = require("express-rate-limit");
  const redisUrl = process.env.REDIS_URL || undefined;
  if (redisUrl) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const RedisStore = require("rate-limit-redis");
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const IORedis = require("ioredis");
      const client = new IORedis(redisUrl);
      return rateLimit({
        windowMs: 60 * 1000,
        max: 600,
        standardHeaders: true,
        legacyHeaders: false,
        store: new RedisStore({ client }),
      });
    } catch (e) {
      // fallback to in-memory limiter
    }
  }

  // fallback: simple in-memory limiter
  return rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 120, // 120 requests per minute per IP
    standardHeaders: true,
    legacyHeaders: false,
  });
}
