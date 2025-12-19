import { AxiosClient, RequestOptions } from './AxiosClient';
import { NormalizedSpec } from '../../domain/models/NormalizedSpec';
import { Operation } from '../../domain/models/Operation';
import { EnvironmentConfig } from '../../domain/models/Environment';

export interface OperationOverrides {
  pathParams?: Record<string, string>;
  queryParams?: Record<string, string>;
  headers?: Record<string, string>;
  body?: any;
}

export class AxiosExecutionAdapter {
  constructor(private httpClient: AxiosClient) {}

  async executeOperation(
    spec: NormalizedSpec,
    operation: Operation,
    env: EnvironmentConfig,
    overrides?: OperationOverrides
  ): Promise<{ status: number; data: any; headers: Record<string, string>; durationMs?: number }> {
    let url = `${env.baseUrl}${operation.path}`;
    let headers = { ...env.defaultHeaders, ...overrides?.headers };
    let params = { ...overrides?.queryParams };
    let data = overrides?.body;

    // Apply path parameters
    if (overrides?.pathParams) {
      for (const [key, value] of Object.entries(overrides.pathParams)) {
        url = url.replace(`{${key}}`, value);
      }
    }

    // Apply authentication
    if (env.authConfig) {
      if (env.authConfig.type === 'bearer' && env.authConfig.token) {
        headers['Authorization'] = `Bearer ${env.authConfig.token}`;
      } else if (env.authConfig.type === 'basic' && env.authConfig.username && env.authConfig.password) {
        const credentials = Buffer.from(`${env.authConfig.username}:${env.authConfig.password}`).toString('base64');
        headers['Authorization'] = `Basic ${credentials}`;
      } else if (env.authConfig.type === 'apikey' && env.authConfig.apiKey) {
        const location = env.authConfig.apiKeyLocation || 'header';
        const name = env.authConfig.apiKeyName || 'X-API-Key';
        if (location === 'header') {
          headers[name] = env.authConfig.apiKey;
        } else if (location === 'query') {
          params[name] = env.authConfig.apiKey;
        }
      }
    }

    const start = Date.now();
    const result = await AxiosClient.request({
      method: operation.method,
      url,
      headers,
      params,
      data,
    });
    const durationMs = Date.now() - start;

    return {
      ...result,
      durationMs,
    };
  }
}

export default AxiosExecutionAdapter;

