import container from '../../../../core/container';
import planRun, { PlanRunRequest } from '../../../../application/execution/planRun.usecase';

/**
 * MCP Tool: planApiRun
 * Plans an API test run by selecting operations and generating test cases
 * 
 * Input:
 * {
 *   specId: string,
 *   envName: string,
 *   selection: {
 *     mode: 'single' | 'tag' | 'full',
 *     operationId?: string,  // For 'single' mode
 *     tags?: string[]       // For 'tag' mode
 *   }
 * }
 * 
 * Output:
 * {
 *   runId: string,
 *   specId: string,
 *   envName: string,
 *   operationCount: number,
 *   testCount: number
 * }
 */
export async function planApiRunTool(input: any): Promise<any> {
  const { specId, envName, selection } = input;
  
  if (!specId || typeof specId !== 'string') {
    throw new Error('specId is required and must be a string');
  }
  
  if (!envName || typeof envName !== 'string') {
    throw new Error('envName is required and must be a string');
  }
  
  if (!selection || !selection.mode) {
    throw new Error('selection.mode is required');
  }

  const validModes = ['single', 'tag', 'full'];
  if (!validModes.includes(selection.mode)) {
    throw new Error(`selection.mode must be one of: ${validModes.join(', ')}`);
  }

  if (selection.mode === 'single' && !selection.operationId) {
    throw new Error('operationId is required for single mode');
  }

  if (selection.mode === 'tag' && (!selection.tags || selection.tags.length === 0)) {
    throw new Error('tags are required for tag mode');
  }

  const request: PlanRunRequest = {
    specId,
    envName,
    selection,
  };

  const result = await planRun(
    container.specRepository as any,
    container.environmentRepository as any,
    container.runPlanRepository as any,
    request
  );

  return {
    runId: result.runId,
    specId: result.specId,
    envName: result.envName,
    operationCount: result.operationCount,
    testCount: result.testCount,
  };
}

export default planApiRunTool;




