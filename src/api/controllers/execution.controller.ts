import { Request, Response } from 'express';
import container from '../../core/container';
import planRun from '../../application/execution/planRun.usecase';
import getRunStatus from '../../application/execution/getRunStatus.usecase';
import retryFailedTest from '../../application/execution/retryFailedTest.usecase';
import executeRun from '../../application/execution/executeRun.usecase';
import { PlanRunRequest, RunStatusResponse } from '../dto/execution.dto';
import NotFoundError from '../../core/errors/NotFoundError';
import ValidationError from '../../core/errors/ValidationError';

/**
 * POST /execution/plan
 * Plan a test run with selected operations
 */
export async function planRunHandler(req: Request, res: Response) {
  try {
    const body = req.body as PlanRunRequest;

    if (!body.specId) return res.status(400).json({ error: 'specId is required' });
    if (!body.envName) return res.status(400).json({ error: 'envName is required' });
    if (!body.selection) return res.status(400).json({ error: 'selection is required' });
    if (!body.selection.mode) return res.status(400).json({ error: 'selection.mode is required' });
    if (body.selection.mode === 'single' && !body.selection.operationId) {
      return res.status(400).json({ error: 'operationId is required for single mode' });
    }
    if (body.selection.mode === 'tag' && (!body.selection.tags || body.selection.tags.length === 0)) {
      return res.status(400).json({ error: 'tags are required for tag mode' });
    }

    const result = await planRun(
      container.specRepository as any,
      container.environmentRepository as any,
      container.runPlanRepository as any,
      body
    );

    return res.status(201).json(result);
  } catch (err: any) {
    if (err instanceof NotFoundError) return res.status(404).json({ error: err.message });
    if (err instanceof ValidationError) return res.status(400).json({ error: err.message, details: err.details });
    return res.status(500).json({ error: err?.message || String(err) });
  }
}

/**
 * POST /execution/run
 * Execute a run by runId, or plan+run by providing specId/envName/selection
 */
export async function executeRunHandler(req: Request, res: Response) {
  try {
    const body = req.body || {};
    const hasPlanInputs = body.specId && body.envName && body.selection;
    if (!body.runId && !hasPlanInputs) {
      return res.status(400).json({ error: 'Provide runId or (specId, envName, selection)' });
    }

    const result = await executeRun(
      container.runPlanRepository as any,
      container.specRepository as any,
      container.environmentRepository as any,
      body
    );

    return res.status(201).json(result);
  } catch (err: any) {
    if (err instanceof NotFoundError) return res.status(404).json({ error: err.message });
    if (err instanceof ValidationError) return res.status(400).json({ error: err.message, details: err.details });
    return res.status(500).json({ error: err?.message || String(err) });
  }
}

/**
 * GET /execution/status/:runId
 * Get the status of a run
 */
export async function getRunStatusHandler(req: Request, res: Response) {
  try {
    const runId = req.params.runId;
    if (!runId) return res.status(400).json({ error: 'runId is required' });

    const report = await getRunStatus(container.runPlanRepository as any, runId);

    const response: RunStatusResponse = {
      runId: report.runId,
      specId: report.specId || '',
      status: report.status,
      startedAt: report.startedAt,
      finishedAt: report.finishedAt,
      steps: report.steps.map(step => ({
        stepId: step.stepId,
        status: step.status,
        startedAt: step.startedAt,
        finishedAt: step.finishedAt,
        error: step.error,
      })),
      aggregatesByTag: report.aggregatesByTag,
      aggregatesByMethod: report.aggregatesByMethod,
      aggregatesByPath: report.aggregatesByPath,
    };

    return res.json(response);
  } catch (err: any) {
    if (err instanceof NotFoundError) return res.status(404).json({ error: err.message });
    return res.status(500).json({ error: err?.message || String(err) });
  }
}

/**
 * POST /execution/retry/:runId
 * Retry failed tests from a previous run
 */
export async function retryFailedTestHandler(req: Request, res: Response) {
  try {
    const runId = req.params.runId;
    if (!runId) return res.status(400).json({ error: 'runId is required' });

    const result = await retryFailedTest(
      container.runPlanRepository as any,
      container.specRepository as any,
      runId
    );

    return res.status(201).json(result);
  } catch (err: any) {
    if (err instanceof NotFoundError) return res.status(404).json({ error: err.message });
    if (err instanceof ValidationError) return res.status(400).json({ error: err.message, details: err.details });
    return res.status(500).json({ error: err?.message || String(err) });
  }
}

export default { planRunHandler, executeRunHandler, getRunStatusHandler, retryFailedTestHandler };
