import { v4 as uuidv4 } from 'uuid';
import { RunPlan } from '../../domain/models/RunPlan';
import { TestCaseDefinition, TestCaseType } from '../../domain/models/TestCaseDefinition';
import { Operation } from '../../domain/models/Operation';
import { SpecRepository } from '../../domain/repositories/SpecRepository';
import { EnvironmentRepository } from '../../domain/repositories/EnvironmentRepository';
import { RunPlanRepository } from '../../domain/repositories/RunPlanRepository';
import NotFoundError from '../../core/errors/NotFoundError';

/**
 * Operation Selection Mode
 */
export type SelectionMode = 'single' | 'tag' | 'full';

/**
 * Operation Selection Criteria
 */
export interface OperationSelection {
  mode: SelectionMode;
  operationId?: string;  // For 'single' mode
  tags?: string[];       // For 'tag' mode
}

/**
 * Plan Run Request
 */
export interface PlanRunRequest {
  specId: string;
  envName: string;
  selection: OperationSelection;
}

/**
 * Plan Run Response
 */
export interface PlanRunResponse {
  runId: string;
  specId: string;
  envName: string;
  operationCount: number;
  testCount: number;
}

/**
 * Build test case definitions for an operation
 * Creates default test cases: happy path, validation error, auth error (if security present)
 */
function buildTestCaseDefinitions(operation: Operation): TestCaseDefinition[] {
  const testCases: TestCaseDefinition[] = [];
  const baseId = operation.id;

  // 1. Happy path test
  testCases.push({
    id: `${baseId}_happy_path`,
    operationId: operation.id,
    testType: 'happy_path',
    expectedStatus: 200, // Default to 200, will be adjusted based on operation
    payloadStrategy: 'schema_defaults',
    description: `Happy path test for ${operation.method} ${operation.path}`,
  });

  // 2. Validation error test (if operation has required parameters or request body)
  const hasRequiredParams = operation.parameters?.some(p => p.required) || operation.requestBody?.required;
  if (hasRequiredParams) {
    testCases.push({
      id: `${baseId}_validation_error`,
      operationId: operation.id,
      testType: 'validation_error',
      expectedStatus: 400,
      payloadStrategy: 'empty', // Empty/invalid payload to trigger validation error
      description: `Validation error test for ${operation.method} ${operation.path}`,
    });
  }

  // 3. Auth error test (if operation has security requirements)
  if (operation.security && operation.security.length > 0) {
    testCases.push({
      id: `${baseId}_auth_error`,
      operationId: operation.id,
      testType: 'auth_error',
      expectedStatus: 401,
      payloadStrategy: 'schema_defaults',
      description: `Authentication error test for ${operation.method} ${operation.path}`,
    });
  }

  return testCases;
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
  selection: OperationSelection
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
 * Plan Run Use Case
 * Creates a RunPlan with selected operations and test case definitions
 */
export default async function planRun(
  specRepo: SpecRepository,
  envRepo: EnvironmentRepository,
  runPlanRepo: RunPlanRepository,
  request: PlanRunRequest
): Promise<PlanRunResponse> {
  // 1. Verify spec exists
  const spec = await specRepo.get(request.specId);
  if (!spec) {
    throw new NotFoundError(`Spec with id ${request.specId} not found`);
  }

  // 2. Verify environment exists
  const environments = await envRepo.listBySpecId(request.specId);
  const env = environments.find(e => e.name === request.envName);
  if (!env) {
    throw new NotFoundError(`Environment "${request.envName}" not found for spec ${request.specId}`);
  }

  // 3. Get operations from spec
  const allOperations = spec.operations || [];
  if (allOperations.length === 0) {
    throw new Error(`Spec ${request.specId} has no operations`);
  }

  // 4. Filter operations based on selection
  const selectedOperations = filterOperations(allOperations, request.selection);
  if (selectedOperations.length === 0) {
    throw new Error(`No operations match the selection criteria`);
  }

  // 5. Build test case definitions for each operation
  const testCaseDefinitions: TestCaseDefinition[] = [];
  for (const operation of selectedOperations) {
    const testCases = buildTestCaseDefinitions(operation);
    testCaseDefinitions.push(...testCases);
  }

  // 6. Create RunPlan
  const runId = uuidv4();
  const now = new Date().toISOString();
  const runPlan: RunPlan = {
    runId,
    specId: request.specId,
    envName: request.envName,
    operations: selectedOperations,
    testCaseDefinitions,
    status: 'pending',
    createdAt: now,
    meta: {
      selectionMode: request.selection.mode,
      selectedTags: request.selection.tags,
      selectedOperationId: request.selection.operationId,
    },
  };

  // 7. Persist RunPlan
  await runPlanRepo.save(runPlan);

  // 8. Return response
  return {
    runId,
    specId: request.specId,
    envName: request.envName,
    operationCount: selectedOperations.length,
    testCount: testCaseDefinitions.length,
  };
}
