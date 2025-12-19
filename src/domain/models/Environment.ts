/**
 * Environment Configuration Model
 * Represents a named environment configuration for a Swagger/OpenAPI spec
 */
export interface EnvironmentConfig {
  id: string;
  specId: string; // REQUIRED - environments belong to specs
  name: string; // e.g., "dev", "qa", "stage", "prod"
  description?: string;
  baseUrl: string; // REQUIRED - base URL for the environment
  defaultHeaders?: Record<string, string>; // Default headers to include in all requests
  authConfig?: {
    type: 'bearer' | 'basic' | 'apikey' | 'oauth2';
    token?: string; // For bearer/apikey
    username?: string; // For basic
    password?: string; // For basic
    apiKey?: string; // For apikey
    apiKeyLocation?: 'header' | 'query'; // For apikey
    apiKeyName?: string; // For apikey
    clientId?: string; // For oauth2
    clientSecret?: string; // For oauth2
    tokenUrl?: string; // For oauth2
    scopes?: string[]; // For oauth2
  };
  createdAt: string;
  updatedAt?: string;
}

// Keep Environment as alias for backwards compatibility during migration
export type Environment = EnvironmentConfig;

export default EnvironmentConfig;
