import planRun from "../src/application/execution/planRun.usecase";
import { SpecRepository } from "../src/domain/repositories/SpecRepository";
import { EnvironmentRepository } from "../src/domain/repositories/EnvironmentRepository";
import { RunPlanRepository } from "../src/domain/repositories/RunPlanRepository";

describe("agent minimal", () => {
  it("throws when spec is missing", async () => {
    const specRepo: SpecRepository = { save: jest.fn(), list: jest.fn(), get: jest.fn().mockResolvedValue(null) } as any;
    const envRepo: EnvironmentRepository = { listBySpecId: jest.fn().mockResolvedValue([]) } as any;
    const runRepo: RunPlanRepository = { save: jest.fn(), get: jest.fn(), list: jest.fn(), update: jest.fn() } as any;

    await expect(
      planRun(specRepo, envRepo, runRepo, {
        specId: 'missing',
        envName: 'dev',
        selection: { mode: 'full' },
      })
    ).rejects.toThrow();
  });
});
