import { Request, Response } from 'express';
import container from '../../core/container';
import createEnvironment from '../../application/environment/createEnvironment.usecase';
import listEnvironments from '../../application/environment/listEnvironments.usecase';
import getEnvironment from '../../application/environment/getEnvironment.usecase';
import updateEnvironment from '../../application/environment/updateEnvironment.usecase';
import deleteEnvironment from '../../application/environment/deleteEnvironment.usecase';
import { CreateEnvironmentRequest, UpdateEnvironmentRequest, EnvironmentResponse, ListEnvironmentsResponse } from '../dto/environment.dto';
import NotFoundError from '../../core/errors/NotFoundError';
import ValidationError from '../../core/errors/ValidationError';

/**
 * Convert domain model to response DTO
 */
function toEnvironmentResponse(env: any): EnvironmentResponse {
  return {
    id: env.id,
    specId: env.specId,
    name: env.name,
    baseUrl: env.baseUrl,
    defaultHeaders: env.defaultHeaders,
    authConfig: env.authConfig,
    createdAt: env.createdAt,
    updatedAt: env.updatedAt,
  };
}

/**
 * POST /environment
 * Create a new environment configuration
 */
export async function createEnv(req: Request, res: Response) {
  try {
    const body = req.body as CreateEnvironmentRequest;
    const created = await createEnvironment(
      container.environmentRepository as any,
      container.specRepository as any,
      body
    );
    return res.status(201).json(toEnvironmentResponse(created));
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
 * GET /environment
 * List all environments (optionally filtered by specId query param)
 */
export async function listEnv(req: Request, res: Response) {
  try {
    const specId = req.query.specId as string | undefined;
    const items = await listEnvironments(container.environmentRepository as any, specId);
    const response: ListEnvironmentsResponse = {
      environments: items.map(toEnvironmentResponse),
      total: items.length,
    };
    return res.json(response);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || String(err) });
  }
}

/**
 * GET /environment/:envId
 * Get a single environment by ID
 */
export async function getEnv(req: Request, res: Response) {
  try {
    const id = req.params.envId;
    if (!id) {
      return res.status(400).json({ error: 'envId is required' });
    }
    const env = await getEnvironment(container.environmentRepository as any, id);
    if (!env) {
      return res.status(404).json({ error: 'Environment not found' });
    }
    return res.json(toEnvironmentResponse(env));
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || String(err) });
  }
}

/**
 * PUT /environment/:envId
 * Update an environment configuration
 */
export async function updateEnv(req: Request, res: Response) {
  try {
    const id = req.params.envId;
    if (!id) {
      return res.status(400).json({ error: 'envId is required' });
    }
    const body = req.body as UpdateEnvironmentRequest;
    const updated = await updateEnvironment(container.environmentRepository as any, id, body);
    if (!updated) {
      return res.status(404).json({ error: 'Environment not found' });
    }
    return res.json(toEnvironmentResponse(updated));
  } catch (err: any) {
    if (err instanceof ValidationError) {
      return res.status(400).json({ error: err.message, details: err.details });
    }
    return res.status(500).json({ error: err?.message || String(err) });
  }
}

/**
 * DELETE /environment/:envId
 * Delete an environment configuration
 */
export async function removeEnv(req: Request, res: Response) {
  try {
    const id = req.params.envId;
    if (!id) {
      return res.status(400).json({ error: 'envId is required' });
    }
    const deleted = await deleteEnvironment(container.environmentRepository as any, id);
    if (!deleted) {
      return res.status(404).json({ error: 'Environment not found' });
    }
    return res.status(204).send();
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || String(err) });
  }
}

export default { createEnv, listEnv, getEnv, updateEnv, removeEnv };
