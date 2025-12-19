import container from '../../../../core/container';
import getRunStatus from '../../../../application/execution/getRunStatus.usecase';
import { AxiosExecutionAdapter } from '../../../../infrastructure/http/AxiosExecutionAdapter';
import NotFoundError from '../../../../core/errors/NotFoundError';

/**
 * MCP Tool: executeOperation
 * Executes a single API operation or a run plan
 * 
 * Input (single operation):
 * {
 *   specId: string,
 *   envName: string,
 *   operationId: string,
 *   overrides?: {
 *     pathParams?: Record<string, string>,
 *     queryParams?: Record<string, string>,
 *     headers?: Record<string, string>,
 *     body?: any
 *   }
 * }
 * 
 * Input (run plan):
 * {
 *   runId: string
 * }
 * 
 * Output:
 * {
 *   status: number,
 *   data: any,
 *   headers: Record<string, string>,
 *   durationMs?: number
 * }
 */
export async function executeOperationTool(input: any): Promise<any> {
  // Check if this is a runId execution or single operation execution
  if (input.runId) {
    // Execute a run plan
    const runPlan = await (container.runPlanRepository as any).get(input.runId);
    if (!runPlan) {
      throw new NotFoundError(`Run plan ${input.runId} not found`);
    }

    // For now, return the run status
    // Full execution would require executeRun use case
    const status = await getRunStatus(container.runPlanRepository as any, input.runId);
    return {
      runId: input.runId,
      status: runPlan.status,
      report: status,
    };
  }

  // Execute single operation
  const { specId, envName, operationId, overrides } = input;
  
  if (!specId || typeof specId !== 'string') {
    throw new Error('specId is required and must be a string');
  }
  
  if (!envName || typeof envName !== 'string') {
    throw new Error('envName is required and must be a string');
  }
  
  if (!operationId || typeof operationId !== 'string') {
    throw new Error('operationId is required and must be a string');
  }

  // Get spec
  const spec = await (container.specRepository as any).get(specId);
  if (!spec) {
    throw new NotFoundError(`Spec ${specId} not found`);
  }

  // Find operation
  const operation = spec.operations?.find((op: any) => 
    op.operationId === operationId || 
    `${op.method}_${op.path}` === operationId
  );
  if (!operation) {
    throw new NotFoundError(`Operation ${operationId} not found in spec ${specId}`);
  }

  // Get environment
  const environments = await (container.environmentRepository as any).listBySpecId(specId);
  const env = environments.find((e: any) => e.name === envName);
  if (!env) {
    throw new NotFoundError(`Environment ${envName} not found for spec ${specId}`);
  }

  // Execute using AxiosExecutionAdapter
  const adapter = new AxiosExecutionAdapter(container.httpClient as any);
  const result = await adapter.executeOperation(spec, operation, env, overrides);

  return {
    status: result.status,
    data: result.data,
    headers: result.headers,
    durationMs: result.durationMs,
  };
}

export default executeOperationTool;

