import { Request, Response } from 'express';
import container from '../../core/container';
import generateAxiosTests, { GenerateAxiosTestsRequest, GenerateAxiosTestsResponse } from '../../application/testgen/generateAxiosTests.usecase';
import NotFoundError from '../../core/errors/NotFoundError';
import ValidationError from '../../core/errors/ValidationError';

/**
 * POST /testgen/generate-axios-tests
 * Generate Axios + Jest test code from spec and selection
 */
export async function generateAxiosTestsHandler(req: Request, res: Response) {
  try {
    const body = req.body as GenerateAxiosTestsRequest;

    const result = await generateAxiosTests(
      container.specRepository as any,
      body
    );

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
 * GET /testgen/spec/:specId/preview
 * Preview generated test suite (no persistence in v1)
 */
export async function previewTestSuiteHandler(req: Request, res: Response) {
  try {
    const specId = req.params.specId;
    if (!specId) {
      return res.status(400).json({ error: 'specId is required' });
    }

    // Generate with default options (full selection)
    const request: GenerateAxiosTestsRequest = {
      specId,
      selection: { mode: 'full' },
      options: {
        includeNegativeTests: true,
        includeAuthTests: true,
        includeBoundaryTests: false,
      },
    };

    const result = await generateAxiosTests(
      container.specRepository as any,
      request
    );

    return res.json(result);
  } catch (err: any) {
    if (err instanceof NotFoundError) {
      return res.status(404).json({ error: err.message });
    }
    return res.status(500).json({ error: err?.message || String(err) });
  }
}

export default { generateAxiosTestsHandler, previewTestSuiteHandler };
