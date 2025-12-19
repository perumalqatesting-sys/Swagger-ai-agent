import { Request, Response, NextFunction } from "express";
import logger from "../../infrastructure/logging/winston.logger";

export default function requestLogger(req: Request, _res: Response, next: NextFunction) {
  try {
    logger.info(`${req.method} ${req.originalUrl}`);
  } catch (err) {
    // swallow logging errors
  }
  next();
}
