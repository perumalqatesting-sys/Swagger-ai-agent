import { Request, Response, NextFunction } from "express";
import logger from "../../infrastructure/logging/winston.logger";

export default function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  try {
    logger.error(err?.stack || err?.message || "Unknown error");
  } catch (e) {
    // ignore
  }

  const status = typeof err?.status === "number" ? err.status : 500;
  const payload = {
    error: err?.message || "Internal Server Error",
    details: err?.details || undefined,
  } as any;

  res.status(status).json(payload);
}
