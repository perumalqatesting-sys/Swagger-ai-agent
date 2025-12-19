import createEnvironment from '../../src/application/environment/createEnvironment.usecase';
import listEnvironments from '../../src/application/environment/listEnvironments.usecase';
import { EnvironmentRepository } from '../../src/domain/repositories/EnvironmentRepository';
import { SpecRepository } from '../../src/domain/repositories/SpecRepository';

describe('Environment usecases', () => {
  test('create and list', async () => {
    const repo: any = {
      store: new Map<string, any>(),
      async create(p: any) {
        const id = 'e1';
        const now = new Date().toISOString();
        const env = { id, ...p, createdAt: now, updatedAt: now };
        repo.store.set(id, env);
        return env;
      },
      async list() {
        return Array.from(repo.store.values());
      },
      async listBySpecId(specId: string) {
        return Array.from(repo.store.values()).filter((e: any) => e.specId === specId);
      },
    } as EnvironmentRepository & { store: Map<string, any> };

    const specRepo: SpecRepository = {
      save: jest.fn(),
      list: jest.fn(),
      get: jest.fn().mockResolvedValue({ id: 'spec1', operations: [] } as any),
    };

    const created = await createEnvironment(repo, specRepo, { specId: 'spec1', name: 'dev', baseUrl: 'http://localhost' });
    expect(created).toBeDefined();

    const all = await listEnvironments(repo, 'spec1');
    expect(all.length).toBeGreaterThan(0);
    expect(all[0].specId).toBe('spec1');
  });
});
