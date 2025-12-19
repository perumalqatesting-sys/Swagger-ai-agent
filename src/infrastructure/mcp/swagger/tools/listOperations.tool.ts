import container from '../../../../core/container';
import listOperations from '../../../../application/spec/listOperations.usecase';

/**
 * MCP Tool: listOperations
 * Lists all operations for a given spec
 * 
 * Input:
 * {
 *   specId: string
 * }
 * 
 * Output:
 * {
 *   operations: Array<{
 *     operationId: string,
 *     method: string,
 *     path: string,
 *     tags: string[],
 *     summary: string
 *   }>
 * }
 */
export async function listOperationsTool(input: any): Promise<any> {
  const { specId } = input;
  
  if (!specId || typeof specId !== 'string') {
    throw new Error('specId is required and must be a string');
  }

  const operations = await listOperations(specId, container.specRepository as any);
  
  return {
    operations,
    count: operations.length,
  };
}

export default listOperationsTool;




