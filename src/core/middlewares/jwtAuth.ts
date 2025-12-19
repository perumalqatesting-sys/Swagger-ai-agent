import { Request, Response, NextFunction } from "express";
// dynamic import to avoid hard dependency at compile-time
const jwt = require("jsonwebtoken");
import env from "../env";

export function requireJwt(role?: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const auth = req.headers.authorization || req.headers.Authorization;
      if (!auth || typeof auth !== "string" || !auth.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
      const token = auth.substring(7);
      const secret = env.getEnv("JWT_SECRET", process.env.JWT_SECRET || "");
      if (!secret) return res.status(500).json({ error: "JWT not configured" });
      const payload = jwt.verify(token, secret);
      // attach user
      (req as any).user = payload;
      if (role && payload && (payload as any).role !== role) return res.status(403).json({ error: "Forbidden" });
      next();
    } catch (err: any) {
      return res.status(401).json({ error: "Unauthorized", details: err?.message });
    }
  };
}

export default requireJwt;
