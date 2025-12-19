import { NormalizedSpec } from '../../domain/models/NormalizedSpec';
import { Operation } from '../../domain/models/Operation';
import { TestCaseDefinition, TestCaseType } from '../../domain/models/TestCaseDefinition';
import { SpecRepository } from '../../domain/repositories/SpecRepository';
import { buildPayloadFromSchemaSimple } from '../llm/buildPayloadFromSchema.usecase';
import NotFoundError from '../../core/errors/NotFoundError';

// Local type definitions to avoid circular dependencies
export type SelectionMode = 'single' | 'tag' | 'full';

export interface OperationSelectionDto {
  mode: SelectionMode;
  operationId?: string;
  tags?: string[];
}

export interface TestGenerationOptions {
  includeNegativeTests?: boolean;
  includeAuthTests?: boolean;
  includeBoundaryTests?: boolean;
}

export interface GenerateAxiosTestsRequest {
  specId: string;
  selection: OperationSelectionDto;
  options?: TestGenerationOptions;
}

export interface TestCaseMetadata {
  operationId: string;
  method: string;
  path: string;
  testType: string;
  expectedStatus: number;
  description?: string;
}

export interface GenerateAxiosTestsResponse {
  code: string;
  tests: TestCaseMetadata[];
  summary: {
    totalTests: number;
    operations: number;
    testTypes: Record<string, number>;
  };
}

/**
 * Map NormalizedSpec.Operation to domain Operation
 */
function mapToDomainOperation(normalizedOp: any): Operation {
  return {
    id: normalizedOp.operationId || `${normalizedOp.method}_${normalizedOp.path}`,
    method: normalizedOp.method,
    path: normalizedOp.path,
    summary: normalizedOp.summary,
    description: normalizedOp.description,
    tags: normalizedOp.tags,
    parameters: normalizedOp.parameters,
    requestBody: normalizedOp.requestBody,
    responses: normalizedOp.responses,
    security: normalizedOp.security,
  };
}

/**
 * Filter operations based on selection criteria
 */
function filterOperations(
  normalizedOperations: any[],
  selection: OperationSelectionDto
): Operation[] {
  // First map to domain operations
  const operations = normalizedOperations.map(mapToDomainOperation);

  switch (selection.mode) {
    case 'single':
      if (!selection.operationId) {
        throw new Error('operationId is required for single mode');
      }
      const op = operations.find(o => o.id === selection.operationId);
      return op ? [op] : [];

    case 'tag':
      if (!selection.tags || selection.tags.length === 0) {
        throw new Error('tags are required for tag mode');
      }
      return operations.filter(op => 
        op.tags && op.tags.some(tag => selection.tags!.includes(tag))
      );

    case 'full':
      return operations;

    default:
      throw new Error(`Unknown selection mode: ${selection.mode}`);
  }
}

/**
 * Build test case definitions for an operation based on options
 */
function buildTestCaseDefinitions(
  operation: Operation,
  options: TestGenerationOptions
): TestCaseDefinition[] {
  const testCases: TestCaseDefinition[] = [];
  const baseId = operation.id;

  // 1. Happy path test (always included)
  testCases.push({
    id: `${baseId}_happy_path`,
    operationId: operation.id,
    testType: 'happy_path',
    expectedStatus: 200,
    payloadStrategy: 'schema_defaults',
    description: `Happy path test for ${operation.method} ${operation.path}`,
  });

  // 2. Validation error test (if options.includeNegativeTests or has required params)
  const hasRequiredParams = operation.parameters?.some((p: any) => p.required) || operation.requestBody?.required;
  if (options.includeNegativeTests !== false && hasRequiredParams) {
    testCases.push({
      id: `${baseId}_validation_error`,
      operationId: operation.id,
      testType: 'validation_error',
      expectedStatus: 400,
      payloadStrategy: 'empty',
      description: `Validation error test for ${operation.method} ${operation.path}`,
    });
  }

  // 3. Auth error test (if options.includeAuthTests or has security)
  if ((options.includeAuthTests !== false) && operation.security && operation.security.length > 0) {
    testCases.push({
      id: `${baseId}_auth_error`,
      operationId: operation.id,
      testType: 'auth_error',
      expectedStatus: 401,
      payloadStrategy: 'schema_defaults',
      description: `Authentication error test for ${operation.method} ${operation.path}`,
    });
  }

  // 4. Boundary tests (if options.includeBoundaryTests)
  if (options.includeBoundaryTests === true) {
    testCases.push({
      id: `${baseId}_boundary_test`,
      operationId: operation.id,
      testType: 'boundary_test',
      expectedStatus: 200,
      payloadStrategy: 'schema_defaults',
      description: `Boundary test for ${operation.method} ${operation.path}`,
    });
  }

  return testCases;
}

/**
 * Generate payload for a test case
 */
async function generatePayloadForTestCase(
  operation: Operation,
  testCase: TestCaseDefinition
): Promise<any> {
  if (testCase.payloadStrategy === 'empty') {
    return null;
  }

  if (testCase.payloadOverride) {
    return testCase.payloadOverride;
  }

  // Try to build from schema
  try {
    const schema = operation.requestBody?.content?.['application/json']?.schema;
    if (schema) {
      return await buildPayloadFromSchemaSimple(schema);
    }
  } catch (e) {
    // Ignore payload generation failures
  }

  return {};
}

/**
 * Generate Axios request config for an operation
 */
function generateAxiosConfig(
  operation: Operation,
  payload: any,
  baseUrl: string = 'https://api.example.com'
): any {
  const config: any = {
    method: operation.method.toLowerCase(),
    url: `${baseUrl}${operation.path}`,
  };

  // Add path parameters (simplified - would need actual values in real implementation)
  if (operation.parameters) {
    const pathParams = operation.parameters.filter((p: any) => p.in === 'path');
    if (pathParams.length > 0) {
      // Replace path params with example values
      let url = operation.path;
      pathParams.forEach((param: any) => {
        url = url.replace(`{${param.name}}`, '123'); // Simple example
      });
      config.url = `${baseUrl}${url}`;
    }

    // Add query parameters
    const queryParams = operation.parameters.filter((p: any) => p.in === 'query');
    if (queryParams.length > 0) {
      config.params = {};
      queryParams.forEach((param: any) => {
        if (param.schema?.default !== undefined) {
          config.params[param.name] = param.schema.default;
        } else if (param.schema?.type === 'string') {
          config.params[param.name] = 'example';
        } else if (param.schema?.type === 'integer' || param.schema?.type === 'number') {
          config.params[param.name] = 0;
        }
      });
    }
  }

  // Add request body
  if (payload !== null && payload !== undefined) {
    config.data = payload;
  }

  return config;
}

/**
 * Template function: Generate Jest describe block for an operation
 */
function generateDescribeBlock(operation: Operation): string {
  const description = operation.summary || operation.description || `${operation.method} ${operation.path}`;
  return `describe('${operation.method} ${operation.path}', () => {
    // ${description}`;
}

/**
 * Template function: Generate Jest it block for a test case
 */
function generateItBlock(testCase: TestCaseDefinition, axiosConfig: any): string {
  const description = testCase.description || `${testCase.testType} test`;
  const configStr = JSON.stringify(axiosConfig, null, 4);
  
  return `
    it('${description}', async () => {
      const response = await axios.request(${configStr});
      expect(response.status).toBe(${testCase.expectedStatus});
    });`;
}

/**
 * Generate Axios + Jest Test Code Use Case
 * Generates Jest+Axios test code from specs and templates
 */
export default async function generateAxiosTests(
  specRepo: SpecRepository,
  request: GenerateAxiosTestsRequest
): Promise<GenerateAxiosTestsResponse> {
  // 1. Verify spec exists
  const spec = await specRepo.get(request.specId);
  if (!spec) {
    throw new NotFoundError(`Spec with id ${request.specId} not found`);
  }

  // 2. Get operations from spec
  const allOperations = spec.operations || [];
  if (allOperations.length === 0) {
    throw new Error(`Spec ${request.specId} has no operations`);
  }

  // 3. Filter operations based on selection
  const selectedOperations = filterOperations(allOperations, request.selection);
  if (selectedOperations.length === 0) {
    throw new Error(`No operations match the selection criteria`);
  }

  // 4. Build test case definitions for each operation
  const options: TestGenerationOptions = {
    includeNegativeTests: request.options?.includeNegativeTests !== false,
    includeAuthTests: request.options?.includeAuthTests !== false,
    includeBoundaryTests: request.options?.includeBoundaryTests === true,
  };

  const allTestCases: Array<{ operation: Operation; testCase: TestCaseDefinition }> = [];
  for (const operation of selectedOperations) {
    const testCases = buildTestCaseDefinitions(operation, options);
    for (const testCase of testCases) {
      allTestCases.push({ operation, testCase });
    }
  }

  // 5. Generate test code
  const codeParts: string[] = [];
  codeParts.push(`const axios = require('axios');`);
  codeParts.push('');
  codeParts.push('// Generated Axios + Jest tests');
  codeParts.push(`// Spec: ${spec.title || request.specId}`);
  codeParts.push(`// Operations: ${selectedOperations.length}`);
  codeParts.push(`// Test Cases: ${allTestCases.length}`);
  codeParts.push('');

  // Group by operation for better organization
  const operationsMap = new Map<Operation, TestCaseDefinition[]>();
  for (const { operation, testCase } of allTestCases) {
    if (!operationsMap.has(operation)) {
      operationsMap.set(operation, []);
    }
    operationsMap.get(operation)!.push(testCase);
  }

  // Generate code for each operation
  for (const [operation, testCases] of operationsMap.entries()) {
    codeParts.push(generateDescribeBlock(operation));
    
    for (const testCase of testCases) {
      // Generate payload for this test case
      const payload = await generatePayloadForTestCase(operation, testCase);
      const axiosConfig = generateAxiosConfig(operation, payload);
      codeParts.push(generateItBlock(testCase, axiosConfig));
    }
    
    codeParts.push('});');
    codeParts.push('');
  }

  const generatedCode = codeParts.join('\n');

  // 6. Build metadata
  const testMetadata: TestCaseMetadata[] = allTestCases.map(({ operation, testCase }) => ({
    operationId: operation.id,
    method: operation.method,
    path: operation.path,
    testType: testCase.testType,
    expectedStatus: testCase.expectedStatus,
    description: testCase.description,
  }));

  // Count test types
  const testTypeCounts: Record<string, number> = {};
  for (const testCase of allTestCases.map(tc => tc.testCase)) {
    testTypeCounts[testCase.testType] = (testTypeCounts[testCase.testType] || 0) + 1;
  }

  return {
    code: generatedCode,
    tests: testMetadata,
    summary: {
      totalTests: allTestCases.length,
      operations: selectedOperations.length,
      testTypes: testTypeCounts,
    },
  };
}
