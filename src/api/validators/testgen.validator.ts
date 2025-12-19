import { Request, Response, NextFunction } from 'express';
import { GenerateAxiosTestsRequest } from '../dto/testgen.dto';

/**
 * Validates generate Axios tests request
 */
export function validateGenerateAxiosTests(req: Request, res: Response, next: NextFunction) {
  const body = req.body as Partial<GenerateAxiosTestsRequest>;

  // Required fields
  if (!body.specId || typeof body.specId !== 'string' || body.specId.trim().length === 0) {
    return res.status(400).json({ error: 'specId is required and must be a non-empty string' });
  }

  if (!body.selection) {
    return res.status(400).json({ error: 'selection is required' });
  }

  if (!body.selection.mode) {
    return res.status(400).json({ error: 'selection.mode is required' });
  }

  const validModes = ['single', 'tag', 'full'];
  if (!validModes.includes(body.selection.mode)) {
    return res.status(400).json({ error: `selection.mode must be one of: ${validModes.join(', ')}` });
  }

  // Validate selection mode specific requirements
  if (body.selection.mode === 'single' && !body.selection.operationId) {
    return res.status(400).json({ error: 'operationId is required for single mode' });
  }

  if (body.selection.mode === 'tag' && (!body.selection.tags || body.selection.tags.length === 0)) {
    return res.status(400).json({ error: 'tags are required for tag mode' });
  }

  // Options validation (optional)
  if (body.options !== undefined) {
    if (typeof body.options !== 'object' || Array.isArray(body.options) || body.options === null) {
      return res.status(400).json({ error: 'options must be an object' });
    }

    if (body.options.includeNegativeTests !== undefined && typeof body.options.includeNegativeTests !== 'boolean') {
      return res.status(400).json({ error: 'options.includeNegativeTests must be a boolean' });
    }

    if (body.options.includeAuthTests !== undefined && typeof body.options.includeAuthTests !== 'boolean') {
      return res.status(400).json({ error: 'options.includeAuthTests must be a boolean' });
    }

    if (body.options.includeBoundaryTests !== undefined && typeof body.options.includeBoundaryTests !== 'boolean') {
      return res.status(400).json({ error: 'options.includeBoundaryTests must be a boolean' });
    }
  }

  next();
}

export default { validateGenerateAxiosTests };





