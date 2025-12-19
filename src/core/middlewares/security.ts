import { Request, Response, NextFunction } from "express";

export default function security() {
  // Lazy-require to avoid TypeScript needing types at compile-time for optional deps
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const helmet = require("helmet");
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const cors = require("cors");

  return [
    helmet(),
    cors({ origin: true }),
    // simple CSP: allow same-origin
    (req: Request, _res: Response, next: NextFunction) => {
      // additional security headers can be placed here
      next();
    },
  ];
}
