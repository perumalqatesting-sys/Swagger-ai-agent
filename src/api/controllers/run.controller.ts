import { Request, Response } from "express";
import executeRun from "../../application/execution/executeRun.usecase";
import container from "../../core/container";

// Legacy controller that now delegates to the unified executeRun use case
export async function runPlan(req: Request, res: Response) {
  try {
    const result = await executeRun(
      container.runPlanRepository as any,
      container.specRepository as any,
      container.environmentRepository as any,
      req.body || {}
    );
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err?.message || String(err) });
  }
}

export default { runPlan };
