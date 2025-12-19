import { Request, Response } from "express";
import env from "../../core/env";
const jwt = require("jsonwebtoken");

export async function mintToken(req: Request, res: Response) {
  try {
    const adminKey = env.getEnv("ADMIN_KEY", process.env.ADMIN_KEY || "");
    if (!adminKey) return res.status(500).json({ error: "ADMIN_KEY not configured" });

    const provided = req.body?.adminKey || req.headers["x-admin-key"];
    if (!provided || provided !== adminKey) return res.status(401).json({ error: "invalid admin key" });

    const jwtSecret = env.getEnv("JWT_SECRET", process.env.JWT_SECRET || "");
    if (!jwtSecret) return res.status(500).json({ error: "JWT_SECRET not configured" });

    const token = jwt.sign({ role: "admin" }, jwtSecret, { expiresIn: "1h" });
    res.json({ token });
  } catch (err: any) {
    res.status(500).json({ error: err?.message });
  }
}

export default { mintToken };
