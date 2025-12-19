import { Request, Response, NextFunction } from 'express';
import { BuildPayloadRequest } from '../dto/llm.dto';

/**
 * Validates build payload request
 */
export function validateBuildPayload(req: Request, res: Response, next: NextFunction) {
  const body = req.body as Partial<BuildPayloadRequest>;

  // Required fields
  if (!body.specId || typeof body.specId !== 'string' || body.specId.trim().length === 0) {
    return res.status(400).json({ error: 'specId is required and must be a non-empty string' });
  }

  if (!body.operationId || typeof body.operationId !== 'string' || body.operationId.trim().length === 0) {
    return res.status(400).json({ error: 'operationId is required and must be a non-empty string' });
  }

  // Validate mode if provided
  if (body.mode !== undefined) {
    const validModes = ['schema-only', 'schema-with-llm'];
    if (!validModes.includes(body.mode)) {
      return res.status(400).json({ error: `mode must be one of: ${validModes.join(', ')}` });
    }
  }

  // Validate hints if provided
  if (body.hints !== undefined) {
    if (typeof body.hints !== 'object' || Array.isArray(body.hints) || body.hints === null) {
      return res.status(400).json({ error: 'hints must be an object' });
    }
  }

  next();
}

export default { validateBuildPayload };





