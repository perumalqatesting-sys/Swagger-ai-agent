import container from '../../../../core/container';
import generateAxiosTests, { GenerateAxiosTestsRequest } from '../../../../application/testgen/generateAxiosTests.usecase';

/**
 * MCP Tool: generateAxiosTests
 * Generates Axios + Jest test code from a spec and selection criteria
 * 
 * Input:
 * {
 *   specId: string,
 *   selection: {
 *     mode: 'single' | 'tag' | 'full',
 *     operationId?: string,  // For 'single' mode
 *     tags?: string[]       // For 'tag' mode
 *   },
 *   options?: {
 *     includeNegativeTests?: boolean,
 *     includeAuthTests?: boolean,
 *     includeBoundaryTests?: boolean
 *   }
 * }
 * 
 * Output:
 * {
 *   code: string,
 *   tests: Array<{
 *     operationId: string,
 *     method: string,
 *     path: string,
 *     testType: string,
 *     expectedStatus: number,
 *     description?: string
 *   }>,
 *   summary: {
 *     totalTests: number,
 *     operations: number,
 *     testTypes: Record<string, number>
 *   }
 * }
 */
export async function generateAxiosTestsTool(input: any): Promise<any> {
  const { specId, selection, options } = input;
  
  if (!specId || typeof specId !== 'string') {
    throw new Error('specId is required and must be a string');
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

  const request: GenerateAxiosTestsRequest = {
    specId,
    selection,
    options,
  };

  const result = await generateAxiosTests(container.specRepository as any, request);

  return {
    code: result.code,
    tests: result.tests,
    summary: result.summary,
  };
}

export default generateAxiosTestsTool;




