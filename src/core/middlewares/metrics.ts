import { Request, Response, NextFunction } from "express";

export function setupMetrics(app: any) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const client = require("prom-client");
  client.collectDefaultMetrics({ timeout: 5000 });

  app.get("/metrics", async (_req: Request, res: Response) => {
    try {
      res.set("Content-Type", client.register.contentType);
      const metrics = await client.register.metrics();
      res.send(metrics);
    } catch (err: any) {
      res.status(500).send(err?.message || "metrics error");
    }
  });
}

export default setupMetrics;
