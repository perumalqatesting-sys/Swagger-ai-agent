import { Request, Response, NextFunction } from "express";

// Phase-1 auth shim: allow all requests. Replace with real auth (JWT, OAuth)
export default function auth(_req: Request, _res: Response, next: NextFunction) {
  // noop for Phase 1
  next();
}
