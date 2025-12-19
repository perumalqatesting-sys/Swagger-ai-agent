import { Request, Response } from 'express';
import listOperationsTool from '../../infrastructure/mcp/swagger/tools/listOperations.tool';
import planApiRunTool from '../../infrastructure/mcp/swagger/tools/planApiRun.tool';
import executeOperationTool from '../../infrastructure/mcp/swagger/tools/executeOperation.tool';
import generateAxiosTestsTool from '../../infrastructure/mcp/swagger/tools/generateAxiosTests.tool';
import NotFoundError from '../../core/errors/NotFoundError';
import ValidationError from '../../core/errors/ValidationError';

/**
 * POST /mcp/swagger/list-operations
 * MCP tool endpoint: List operations for a spec
 */
export async function listOperationsHandler(req: Request, res: Response) {
  try {
    const result = await listOperationsTool(req.body);
    return res.json(result);
  } catch (err: any) {
    if (err instanceof NotFoundError) {
      return res.status(404).json({ error: err.message });
    }
    if (err instanceof ValidationError) {
      return res.status(400).json({ error: err.message, details: err.details });
    }
    return res.status(500).json({ error: err?.message || String(err) });
  }
}

/**
 * POST /mcp/swagger/plan-run
 * MCP tool endpoint: Plan an API test run
 */
export async function planApiRunHandler(req: Request, res: Response) {
  try {
    const result = await planApiRunTool(req.body);
    return res.json(result);
  } catch (err: any) {
    if (err instanceof NotFoundError) {
      return res.status(404).json({ error: err.message });
    }
    if (err instanceof ValidationError) {
      return res.status(400).json({ error: err.message, details: err.details });
    }
    return res.status(500).json({ error: err?.message || String(err) });
  }
}

/**
 * POST /mcp/swagger/execute-operation
 * MCP tool endpoint: Execute a single operation or run plan
 */
export async function executeOperationHandler(req: Request, res: Response) {
  try {
    const result = await executeOperationTool(req.body);
    return res.json(result);
  } catch (err: any) {
    if (err instanceof NotFoundError) {
      return res.status(404).json({ error: err.message });
    }
    if (err instanceof ValidationError) {
      return res.status(400).json({ error: err.message, details: err.details });
    }
    return res.status(500).json({ error: err?.message || String(err) });
  }
}

/**
 * POST /mcp/swagger/generate-tests
 * MCP tool endpoint: Generate Axios + Jest test code
 */
export async function generateAxiosTestsHandler(req: Request, res: Response) {
  try {
    const result = await generateAxiosTestsTool(req.body);
    return res.json(result);
  } catch (err: any) {
    if (err instanceof NotFoundError) {
      return res.status(404).json({ error: err.message });
    }
    if (err instanceof ValidationError) {
      return res.status(400).json({ error: err.message, details: err.details });
    }
    return res.status(500).json({ error: err?.message || String(err) });
  }
}

export default {
  listOperationsHandler,
  planApiRunHandler,
  executeOperationHandler,
  generateAxiosTestsHandler,
};





