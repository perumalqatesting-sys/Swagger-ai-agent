import { Request, Response } from "express";
import generateAxiosTests from "../../application/testgen/generateAxiosTests.usecase";
import container from "../../core/container";
import fs from "fs/promises";
import path from "path";

export async function exportTest(req: Request, res: Response) {
  try {
    const { specId, selection, options, filename } = req.body;
    if (!specId) return res.status(400).json({ error: "specId required" });
    if (!selection) return res.status(400).json({ error: "selection required" });
    
    const result = await generateAxiosTests(container.specRepository as any, {
      specId,
      selection,
      options,
    });
    
    const outDir = path.resolve(process.cwd(), "generated-tests");
    await fs.mkdir(outDir, { recursive: true });
    const outPath = path.join(outDir, filename || `test_${Date.now()}.spec.js`);
    await fs.writeFile(outPath, result.code, "utf-8");
    res.json({ path: outPath, summary: result.summary });
  } catch (err: any) {
    res.status(500).json({ error: err?.message });
  }
}

export default { exportTest };
