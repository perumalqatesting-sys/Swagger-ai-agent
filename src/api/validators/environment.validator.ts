import { Request, Response, NextFunction } from 'express';
import { CreateEnvironmentRequest, UpdateEnvironmentRequest } from '../dto/environment.dto';

/**
 * Validates URL format
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates authentication configuration structure
 */
function validateAuthConfig(authConfig: any): string | null {
  if (!authConfig || typeof authConfig !== 'object') {
    return 'authConfig must be an object';
  }

  const validTypes = ['bearer', 'basic', 'apikey', 'oauth2'];
  if (!authConfig.type || !validTypes.includes(authConfig.type)) {
    return `authConfig.type must be one of: ${validTypes.join(', ')}`;
  }

  // Validate bearer/apikey
  if (authConfig.type === 'bearer' || authConfig.type === 'apikey') {
    if (!authConfig.token && !authConfig.apiKey) {
      return `${authConfig.type} auth requires token or apiKey`;
    }
    if (authConfig.type === 'apikey') {
      if (authConfig.apiKeyLocation && !['header', 'query'].includes(authConfig.apiKeyLocation)) {
        return 'apiKeyLocation must be "header" or "query"';
      }
    }
  }

  // Validate basic
  if (authConfig.type === 'basic') {
    if (!authConfig.username || !authConfig.password) {
      return 'basic auth requires username and password';
    }
  }

  // Validate oauth2
  if (authConfig.type === 'oauth2') {
    if (!authConfig.clientId || !authConfig.clientSecret || !authConfig.tokenUrl) {
      return 'oauth2 auth requires clientId, clientSecret, and tokenUrl';
    }
    if (!isValidUrl(authConfig.tokenUrl)) {
      return 'tokenUrl must be a valid URL';
    }
  }

  return null;
}

/**
 * Validates create environment request
 */
export function validateCreateEnv(req: Request, res: Response, next: NextFunction) {
  const body = req.body as Partial<CreateEnvironmentRequest>;

  // Required fields
  if (!body.specId) {
    return res.status(400).json({ error: 'specId is required' });
  }
  if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
    return res.status(400).json({ error: 'name is required and must be a non-empty string' });
  }
  if (!body.baseUrl || typeof body.baseUrl !== 'string') {
    return res.status(400).json({ error: 'baseUrl is required and must be a string' });
  }

  // Validate baseUrl format
  if (!isValidUrl(body.baseUrl)) {
    return res.status(400).json({ error: 'baseUrl must be a valid URL' });
  }

  // Validate defaultHeaders if provided
  if (body.defaultHeaders !== undefined) {
    if (typeof body.defaultHeaders !== 'object' || Array.isArray(body.defaultHeaders) || body.defaultHeaders === null) {
      return res.status(400).json({ error: 'defaultHeaders must be an object' });
    }
    // Validate all header values are strings
    for (const [key, value] of Object.entries(body.defaultHeaders)) {
      if (typeof value !== 'string') {
        return res.status(400).json({ error: `defaultHeaders.${key} must be a string` });
      }
    }
  }

  // Validate authConfig if provided
  if (body.authConfig !== undefined) {
    const authError = validateAuthConfig(body.authConfig);
    if (authError) {
      return res.status(400).json({ error: authError });
    }
  }

  next();
}

/**
 * Validates update environment request
 */
export function validateUpdateEnv(req: Request, res: Response, next: NextFunction) {
  const body = req.body as Partial<UpdateEnvironmentRequest>;

  // At least one field must be provided
  if (Object.keys(body).length === 0) {
    return res.status(400).json({ error: 'at least one field must be provided for update' });
  }

  // Validate baseUrl format if provided
  if (body.baseUrl !== undefined) {
    if (typeof body.baseUrl !== 'string') {
      return res.status(400).json({ error: 'baseUrl must be a string' });
    }
    if (!isValidUrl(body.baseUrl)) {
      return res.status(400).json({ error: 'baseUrl must be a valid URL' });
    }
  }

  // Validate name if provided
  if (body.name !== undefined) {
    if (typeof body.name !== 'string' || body.name.trim().length === 0) {
      return res.status(400).json({ error: 'name must be a non-empty string' });
    }
  }

  // Validate defaultHeaders if provided
  if (body.defaultHeaders !== undefined) {
    if (typeof body.defaultHeaders !== 'object' || Array.isArray(body.defaultHeaders) || body.defaultHeaders === null) {
      return res.status(400).json({ error: 'defaultHeaders must be an object' });
    }
    // Validate all header values are strings
    for (const [key, value] of Object.entries(body.defaultHeaders)) {
      if (typeof value !== 'string') {
        return res.status(400).json({ error: `defaultHeaders.${key} must be a string` });
      }
    }
  }

  // Validate authConfig if provided
  if (body.authConfig !== undefined) {
    const authError = validateAuthConfig(body.authConfig);
    if (authError) {
      return res.status(400).json({ error: authError });
    }
  }

  next();
}

export default { validateCreateEnv, validateUpdateEnv };
