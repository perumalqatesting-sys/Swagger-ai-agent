import { v4 as uuidv4 } from 'uuid';
import { RunPlan } from '../../domain/models/RunPlan';
import { TestCaseDefinition } from '../../domain/models/TestCaseDefinition';
import { RunPlanRepository } from '../../domain/repositories/RunPlanRepository';
import { SpecRepository } from '../../domain/repositories/SpecRepository';
import getRunStatus from './getRunStatus.usecase';
import NotFoundError from '../../core/errors/NotFoundError';
import ValidationError from '../../core/errors/ValidationError';

/**
 * Retry Failed Test Response
 */
export interface RetryFailedTestResponse {
  runId: string;
  originalRunId: string;
  specId: string;
  envName: string;
  operationCount: number;
  testCount: number;
}

/**
 * Retry Failed Test Use Case
 * Creates a new RunPlan containing only the failed tests from a previous run
 */
export default async function retryFailedTest(
  runPlanRepo: RunPlanRepository,
  specRepo: SpecRepository,
  runId: string
): Promise<RetryFailedTestResponse> {
  // 1. Fetch the original run plan
  const originalRunPlan = await runPlanRepo.get(runId);
  if (!originalRunPlan) {
    throw new NotFoundError(`Run plan with id ${runId} not found`);
  }

  // 2. Get the run report to identify failed tests
  const runReport = await getRunStatus(runPlanRepo, runId);

  // 3. Extract failed test case IDs from the report
  const failedStepIds = runReport.steps
    .filter(step => step.status === 'failed')
    .map(step => step.stepId);

  if (failedStepIds.length === 0) {
    throw new ValidationError('No failed tests found in the run. Nothing to retry.');
  }

  // 4. Filter test case definitions to only include failed ones
  const failedTestCases = originalRunPlan.testCaseDefinitions.filter(
    testCase => failedStepIds.includes(testCase.id)
  );

  if (failedTestCases.length === 0) {
    throw new ValidationError('No matching test case definitions found for failed tests.');
  }

  // 5. Get unique operation IDs from failed test cases
  const failedOperationIds = new Set(
    failedTestCases.map(testCase => testCase.operationId)
  );

  // 6. Filter operations to only include those with failed tests
  const failedOperations = originalRunPlan.operations.filter(
    operation => failedOperationIds.has(operation.id)
  );

  // 7. Create a new RunPlan with only failed tests
  const newRunId = uuidv4();
  const now = new Date().toISOString();
  const retryRunPlan: RunPlan = {
    runId: newRunId,
    specId: originalRunPlan.specId,
    envName: originalRunPlan.envName,
    operations: failedOperations,
    testCaseDefinitions: failedTestCases,
    status: 'pending',
    createdAt: now,
    meta: {
      ...originalRunPlan.meta,
      isRetry: true,
      originalRunId: runId,
      retryReason: 'Failed tests from previous run',
    },
  };

  // 8. Persist the new RunPlan
  await runPlanRepo.save(retryRunPlan);

  // 9. Return response
  return {
    runId: newRunId,
    originalRunId: runId,
    specId: originalRunPlan.specId,
    envName: originalRunPlan.envName,
    operationCount: failedOperations.length,
    testCount: failedTestCases.length,
  };
}
