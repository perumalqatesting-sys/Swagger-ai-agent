import { Request, Response, NextFunction } from "express";

// Lightweight request validator placeholder. Accepts an optional function that
// should throw or return a validation error object. For Phase 1 this is a no-op shim.
export function validateRequest(validator?: (req: Request) => void) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (validator) validator(req);
      next();
    } catch (err) {
      // convert to a generic validation error shape
      const e: any = err || { message: "Invalid request" };
      e.status = e.status || 400;
      next(e);
    }
  };
}
