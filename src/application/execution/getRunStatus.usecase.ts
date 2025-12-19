import { RunPlanRepository } from '../../domain/repositories/RunPlanRepository';
import { RunReport, TagAggregate, MethodAggregate, PathAggregate, StepReport } from '../../domain/models/RunReport';
import NotFoundError from '../../core/errors/NotFoundError';

/**
 * Calculate aggregated status by tag
 */
function calculateTagAggregates(
  runPlan: any,
  steps: StepReport[]
): TagAggregate[] {
  const tagMap = new Map<string, { total: number; success: number; failed: number }>();

  // Initialize from operations
  for (const op of runPlan.operations || []) {
    const tags = op.tags || [];
    for (const tag of tags) {
      if (!tagMap.has(tag)) {
        tagMap.set(tag, { total: 0, success: 0, failed: 0 });
      }
    }
  }

  // Count from steps
  for (const step of steps) {
    // Find operation for this step
    const testCase = runPlan.testCaseDefinitions?.find((tc: any) => tc.id === step.stepId);
    if (!testCase) continue;
    
    const operation = runPlan.operations?.find((op: any) => op.id === testCase.operationId);
    if (!operation) continue;

    const tags = operation.tags || [];
    for (const tag of tags) {
      const stats = tagMap.get(tag);
      if (stats) {
        stats.total++;
        if (step.status === 'success') stats.success++;
        else if (step.status === 'failed') stats.failed++;
      }
    }
  }

  return Array.from(tagMap.entries()).map(([tag, stats]) => ({
    tag,
    total: stats.total,
    success: stats.success,
    failed: stats.failed,
    successRate: stats.total > 0 ? (stats.success / stats.total) * 100 : 0,
  }));
}

/**
 * Calculate aggregated status by HTTP method
 */
function calculateMethodAggregates(
  runPlan: any,
  steps: StepReport[]
): MethodAggregate[] {
  const methodMap = new Map<string, { total: number; success: number; failed: number }>();

  // Initialize from operations
  for (const op of runPlan.operations || []) {
    const method = op.method?.toUpperCase() || 'UNKNOWN';
    if (!methodMap.has(method)) {
      methodMap.set(method, { total: 0, success: 0, failed: 0 });
    }
  }

  // Count from steps
  for (const step of steps) {
    const testCase = runPlan.testCaseDefinitions?.find((tc: any) => tc.id === step.stepId);
    if (!testCase) continue;
    
    const operation = runPlan.operations?.find((op: any) => op.id === testCase.operationId);
    if (!operation) continue;

    const method = operation.method?.toUpperCase() || 'UNKNOWN';
    const stats = methodMap.get(method);
    if (stats) {
      stats.total++;
      if (step.status === 'success') stats.success++;
      else if (step.status === 'failed') stats.failed++;
    }
  }

  return Array.from(methodMap.entries()).map(([method, stats]) => ({
    method,
    total: stats.total,
    success: stats.success,
    failed: stats.failed,
    successRate: stats.total > 0 ? (stats.success / stats.total) * 100 : 0,
  }));
}

/**
 * Calculate aggregated status by path
 */
function calculatePathAggregates(
  runPlan: any,
  steps: StepReport[]
): PathAggregate[] {
  const pathMap = new Map<string, { total: number; success: number; failed: number }>();

  // Initialize from operations
  for (const op of runPlan.operations || []) {
    const path = op.path || 'unknown';
    if (!pathMap.has(path)) {
      pathMap.set(path, { total: 0, success: 0, failed: 0 });
    }
  }

  // Count from steps
  for (const step of steps) {
    const testCase = runPlan.testCaseDefinitions?.find((tc: any) => tc.id === step.stepId);
    if (!testCase) continue;
    
    const operation = runPlan.operations?.find((op: any) => op.id === testCase.operationId);
    if (!operation) continue;

    const path = operation.path || 'unknown';
    const stats = pathMap.get(path);
    if (stats) {
      stats.total++;
      if (step.status === 'success') stats.success++;
      else if (step.status === 'failed') stats.failed++;
    }
  }

  return Array.from(pathMap.entries()).map(([path, stats]) => ({
    path,
    total: stats.total,
    success: stats.success,
    failed: stats.failed,
    successRate: stats.total > 0 ? (stats.success / stats.total) * 100 : 0,
  }));
}

/**
 * Get Run Status Use Case
 * Retrieves the status of a run plan with aggregated statistics
 */
export default async function getRunStatus(
  runPlanRepo: RunPlanRepository,
  runId: string
): Promise<RunReport> {
  const runPlan = await runPlanRepo.get(runId);
  if (!runPlan) {
    throw new NotFoundError(`Run plan with id ${runId} not found`);
  }

  // Get steps from runPlan (if available) or use empty array
  const steps: StepReport[] = runPlan.steps?.map((step: any) => ({
    stepId: step.id || step.stepId || '',
    status: step.status === 'success' ? 'success' : (step.status === 'failed' ? 'failed' : 'success'),
    startedAt: step.startedAt,
    finishedAt: step.finishedAt,
    error: step.error,
    response: step.response || step.output,
  })) || [];

  // Calculate aggregates
  const aggregatesByTag = calculateTagAggregates(runPlan, steps);
  const aggregatesByMethod = calculateMethodAggregates(runPlan, steps);
  const aggregatesByPath = calculatePathAggregates(runPlan, steps);

  const report: RunReport = {
    runId: runPlan.runId,
    specId: runPlan.specId,
    status: runPlan.status,
    startedAt: runPlan.createdAt,
    finishedAt: runPlan.updatedAt,
    steps,
    plan: runPlan,
    aggregatesByTag,
    aggregatesByMethod,
    aggregatesByPath,
  };

  return report;
}




