import express from "express";
import routes from "../api/routes";
import requestLogger from "./middlewares/requestLogger";
import errorHandler from "./middlewares/errorHandler";
import security from "./middlewares/security";
import rateLimiter from "./middlewares/rateLimiter";
import setupMetrics from "./middlewares/metrics";

export function createApp() {
  const app = express();
  // Increased limit for spec uploads (10MB), but we'll validate size in validator
  app.use(express.json({ limit: "10mb" }));

  // security middlewares (helmet + cors)
  const sec = security();
  sec.forEach((m) => app.use(m));

  // simple rate limiter
  app.use(rateLimiter());

  // metrics endpoint
  setupMetrics(app);

  // health
  app.get("/health", (_req, res) => res.json({ status: "ok" }));

  // request logger middleware
  app.use(requestLogger);

  // api routes
  app.use("/api", routes);

  // centralized error handler (must be last)
  app.use(errorHandler as any);

  return app;
}

export default createApp;
