import { EnvironmentConfig } from '../../domain/models/Environment';

/**
 * Environment DTOs
 * Data Transfer Objects for environment configuration endpoints
 */

// ============================================================================
// Request DTOs
// ============================================================================

/**
 * Request to create a new environment configuration
 */
export interface CreateEnvironmentRequest {
  /** Spec ID this environment belongs to */
  specId: string;
  /** Environment name (e.g., "dev", "qa", "stage", "prod") */
  name: string;
  /** Base URL for the environment */
  baseUrl: string;
  /** Default headers to include in all requests */
  defaultHeaders?: Record<string, string>;
  /** Authentication configuration */
  authConfig?: {
    type: 'bearer' | 'basic' | 'apikey' | 'oauth2';
    token?: string;
    username?: string;
    password?: string;
    apiKey?: string;
    apiKeyLocation?: 'header' | 'query';
    apiKeyName?: string;
    clientId?: string;
    clientSecret?: string;
    tokenUrl?: string;
    scopes?: string[];
  };
}

/**
 * Request to update an environment configuration
 */
export interface UpdateEnvironmentRequest {
  /** Environment name */
  name?: string;
  /** Base URL */
  baseUrl?: string;
  /** Default headers */
  defaultHeaders?: Record<string, string>;
  /** Authentication configuration */
  authConfig?: {
    type: 'bearer' | 'basic' | 'apikey' | 'oauth2';
    token?: string;
    username?: string;
    password?: string;
    apiKey?: string;
    apiKeyLocation?: 'header' | 'query';
    apiKeyName?: string;
    clientId?: string;
    clientSecret?: string;
    tokenUrl?: string;
    scopes?: string[];
  };
}

// ============================================================================
// Response DTOs
// ============================================================================

/**
 * Environment configuration response
 */
export interface EnvironmentResponse {
  /** Environment ID */
  id: string;
  /** Spec ID this environment belongs to */
  specId: string;
  /** Environment name */
  name: string;
  /** Base URL */
  baseUrl: string;
  /** Default headers */
  defaultHeaders?: Record<string, string>;
  /** Authentication configuration */
  authConfig?: EnvironmentConfig['authConfig'];
  /** Created timestamp */
  createdAt: string;
  /** Updated timestamp */
  updatedAt?: string;
}

/**
 * Response for listing environments
 */
export interface ListEnvironmentsResponse {
  /** List of environments */
  environments: EnvironmentResponse[];
  /** Total count */
  total: number;
}

export default {};

