import generateAxiosTests from '../../src/application/testgen/generateAxiosTests.usecase';
import { SpecRepository } from '../../src/domain/repositories/SpecRepository';
import { NormalizedSpec } from '../../src/domain/models/NormalizedSpec';

describe('generateAxiosTests use case', () => {
  let mockSpecRepo: jest.Mocked<SpecRepository>;

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
        responses: {
          '200': {
            description: 'Success',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { type: 'object' },
                },
              },
            },
          },
        },
      },
      {
        operationId: 'op2',
        method: 'POST',
        path: '/users',
        tags: ['users'],
        summary: 'Create user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string' },
                },
                required: ['name', 'email'],
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Created',
          },
        },
      },
    ],
  };

  beforeEach(() => {
    mockSpecRepo = {
      save: jest.fn(),
      get: jest.fn().mockResolvedValue(mockSpec),
      list: jest.fn(),
    };
  });

  test('should generate Jest test code for full selection', async () => {
    const request = {
      specId: 'test-spec-1',
      selection: {
        mode: 'full' as const,
      },
    };

    const result = await generateAxiosTests(mockSpecRepo, request);

    expect(result).toBeDefined();
    expect(result.code).toBeDefined();
    expect(typeof result.code).toBe('string');
    expect(result.code).toContain('describe');
    expect(result.code).toContain('it(');
    expect(result.code).toContain('axios');
    expect(result.code).toContain('expect');
    expect(result.summary.operations).toBe(2);
    expect(result.summary.totalTests).toBeGreaterThan(0);
  });

  test('should generate test code for tag selection', async () => {
    const request = {
      specId: 'test-spec-1',
      selection: {
        mode: 'tag' as const,
        tags: ['users'],
      },
    };

    const result = await generateAxiosTests(mockSpecRepo, request);

    expect(result.summary.operations).toBe(2); // Both operations have 'users' tag
    expect(result.code).toContain('users');
  });

  test('should generate test code for single operation', async () => {
    const request = {
      specId: 'test-spec-1',
      selection: {
        mode: 'single' as const,
        operationId: 'op1',
      },
    };

    const result = await generateAxiosTests(mockSpecRepo, request);

    expect(result.summary.operations).toBe(1);
    expect(result.code).toContain('GET');
    expect(result.code).toContain('/users');
  });

  test('should include test cases for different scenarios', async () => {
    const request = {
      specId: 'test-spec-1',
      selection: {
        mode: 'single' as const,
        operationId: 'op2', // POST with required body
      },
    };

    const result = await generateAxiosTests(mockSpecRepo, request);

    // Should include happy path and validation error tests (case-insensitive)
    const codeLower = result.code.toLowerCase();
    expect(codeLower).toContain('happy path test');
    expect(codeLower).toContain('validation error test');
  });

  test('should throw error if spec not found', async () => {
    mockSpecRepo.get = jest.fn().mockResolvedValue(null as any);

    const request = {
      specId: 'non-existent',
      selection: { mode: 'full' as const },
    };

    await expect(generateAxiosTests(mockSpecRepo, request)).rejects.toThrow();
  });

  test('should generate proper Jest structure', async () => {
    const request = {
      specId: 'test-spec-1',
      selection: { mode: 'full' as const },
    };

    const result = await generateAxiosTests(mockSpecRepo, request);

    // Check for Jest structure
    expect(result.code).toMatch(/describe\(/);
    expect(result.code).toMatch(/it\(/);
    expect(result.code).toMatch(/expect\(/);
    
    // Check for Axios usage
    expect(result.code).toMatch(/axios\.request/i);
    
    // Check for proper test organization
    expect(result.code).toContain('test');
  });

  test('should handle operations with no request body', async () => {
    const request = {
      specId: 'test-spec-1',
      selection: {
        mode: 'single' as const,
        operationId: 'op1', // GET without body
      },
    };

    const result = await generateAxiosTests(mockSpecRepo, request);

    expect(result.code).toBeDefined();
    // GET requests shouldn't have body in the test
    expect(result.code).not.toContain('data:');
  });
});
