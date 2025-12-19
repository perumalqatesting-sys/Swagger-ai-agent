import exportCtrl from "../src/api/controllers/testgenExport.controller";
import fs from "fs/promises";
import path from "path";
import container from "../src/core/container";

describe("testgen export controller", () => {
  const outDir = path.resolve(process.cwd(), "generated-tests");
  const filename = `export_test_${Date.now()}.spec.js`;
  const outPath = path.join(outDir, filename);

  beforeAll(async () => {
    await container.specRepository.save('spec-export', {
      id: 'spec-export',
      title: 'Export API',
      operations: [
        {
          operationId: 'ping',
          method: 'GET',
          path: '/ping',
        },
      ],
    } as any);
  });

  afterAll(async () => {
    try {
      await fs.unlink(outPath);
    } catch (_) {}
  });

  it("writes a generated test file to disk", async () => {
    const req: any = { body: { specId: 'spec-export', selection: { mode: 'full' }, filename } };
    const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    await exportCtrl.exportTest(req, res as any);
    // ensure controller responded with path
    expect(res.json).toHaveBeenCalled();
    // ensure file exists
    const st = await fs.stat(outPath);
    expect(st.isFile()).toBe(true);
  });
});
