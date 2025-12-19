import planRun from '../../src/application/execution/planRun.usecase';
import { SpecRepository } from '../../src/domain/repositories/SpecRepository';
import { EnvironmentRepository } from '../../src/domain/repositories/EnvironmentRepository';
import { RunPlanRepository } from '../../src/domain/repositories/RunPlanRepository';
import { NormalizedSpec } from '../../src/domain/models/NormalizedSpec';
import { EnvironmentConfig } from '../../src/domain/models/Environment';

describe('planRun use case', () => {
  let mockSpecRepo: jest.Mocked<SpecRepository>;
  let mockEnvRepo: jest.Mocked<EnvironmentRepository>;
  let mockRunPlanRepo: jest.Mocked<RunPlanRepository>;

  const mockSpec: NormalizedSpec = {
    id: 'test-spec-1',
    title: 'Test API',
    version: '1.0.0',
    operations: [
      {
        operationId: 'op1',
        method: 'GET',
        path: '/users',
        tags: ['users'],
        summary: 'Get users',
      },
      {
        operationId: 'op2',
        method: 'POST',
        path: '/users',
        tags: ['users'],
        summary: 'Create user',
        requestBody: { required: true },
      },
      {
        operationId: 'op3',
        method: 'GET',
        path: '/posts',
        tags: ['posts'],
        summary: 'Get posts',
      },
    ],
  };

  const mockEnv: EnvironmentConfig = {
    id: 'env1',
    specId: 'test-spec-1',
    name: 'test-env',
    description: 'Test environment',
    baseUrl: 'https://api.test.com',
    defaultHeaders: {},
    createdAt: new Date().toISOString(),
  };

  beforeEach(() => {
    mockSpecRepo = {
      save: jest.fn(),
      get: jest.fn().mockResolvedValue(mockSpec),
      list: jest.fn(),
    };

    mockEnvRepo = {
      create: jest.fn(),
      get: jest.fn(),
      list: jest.fn(),
      listBySpecId: jest.fn().mockResolvedValue([mockEnv]),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockRunPlanRepo = {
      save: jest.fn().mockImplementation(async (plan) => plan),
      get: jest.fn(),
      list: jest.fn(),
      update: jest.fn(),
    };
  });

  test('should plan a run with full selection', async () => {
    const request = {
      specId: 'test-spec-1',
      envName: 'test-env',
      selection: {
        mode: 'full' as const,
      },
    };

    const result = await planRun(mockSpecRepo, mockEnvRepo, mockRunPlanRepo, request);

    expect(result).toBeDefined();
    expect(result.runId).toBeDefined();
    expect(result.specId).toBe('test-spec-1');
    expect(result.envName).toBe('test-env');
    expect(result.operationCount).toBe(3);
    expect(result.testCount).toBeGreaterThan(0);

    expect(mockRunPlanRepo.save).toHaveBeenCalled();
    const savedPlan = (mockRunPlanRepo.save as jest.Mock).mock.calls[0][0];
    expect(savedPlan.operations).toHaveLength(3);
    expect(savedPlan.testCaseDefinitions.length).toBeGreaterThan(0);
  });

  test('should plan a run with tag selection', async () => {
    const request = {
      specId: 'test-spec-1',
      envName: 'test-env',
      selection: {
        mode: 'tag' as const,
        tags: ['users'],
      },
    };

    const result = await planRun(mockSpecRepo, mockEnvRepo, mockRunPlanRepo, request);

    expect(result.operationCount).toBe(2); // Only users operations
    expect(result.testCount).toBeGreaterThan(0);

    const savedPlan = (mockRunPlanRepo.save as jest.Mock).mock.calls[0][0];
    expect(savedPlan.operations.every((op: any) => op.tags?.includes('users'))).toBe(true);
  });

  test('should plan a run with single operation selection', async () => {
    const request = {
      specId: 'test-spec-1',
      envName: 'test-env',
      selection: {
        mode: 'single' as const,
        operationId: 'op1',
      },
    };

    const result = await planRun(mockSpecRepo, mockEnvRepo, mockRunPlanRepo, request);

    expect(result.operationCount).toBe(1);
    expect(result.testCount).toBeGreaterThan(0);

    const savedPlan = (mockRunPlanRepo.save as jest.Mock).mock.calls[0][0];
    expect(savedPlan.operations[0].id).toBe('op1');
  });

  test('should throw error if spec not found', async () => {
    mockSpecRepo.get = jest.fn().mockResolvedValue(null as any);

    const request = {
      specId: 'non-existent',
      envName: 'test-env',
      selection: { mode: 'full' as const },
    };

    await expect(planRun(mockSpecRepo, mockEnvRepo, mockRunPlanRepo, request)).rejects.toThrow();
  });

  test('should throw error if environment not found', async () => {
    mockEnvRepo.listBySpecId = jest.fn().mockResolvedValue([]);

    const request = {
      specId: 'test-spec-1',
      envName: 'non-existent',
      selection: { mode: 'full' as const },
    };

    await expect(planRun(mockSpecRepo, mockEnvRepo, mockRunPlanRepo, request)).rejects.toThrow();
  });

  test('should create test cases for operations with required parameters', async () => {
    const request = {
      specId: 'test-spec-1',
      envName: 'test-env',
      selection: {
        mode: 'single' as const,
        operationId: 'op2', // POST /users with required requestBody
      },
    };

    const result = await planRun(mockSpecRepo, mockEnvRepo, mockRunPlanRepo, request);

    const savedPlan = (mockRunPlanRepo.save as jest.Mock).mock.calls[0][0];
    const testCases = savedPlan.testCaseDefinitions;
    
    // Should have happy path and validation error test cases
    expect(testCases.some((tc: any) => tc.testType === 'happy_path')).toBe(true);
    expect(testCases.some((tc: any) => tc.testType === 'validation_error')).toBe(true);
  });
});
