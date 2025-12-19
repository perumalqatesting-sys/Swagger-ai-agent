import AxiosClient from '../../src/infrastructure/http/AxiosClient';
import { AxiosExecutionAdapter } from '../../src/infrastructure/http/AxiosExecutionAdapter';
import { NormalizedSpec } from '../../src/domain/models/NormalizedSpec';
import { Operation } from '../../src/domain/models/Operation';
import { EnvironmentConfig } from '../../src/domain/models/Environment';

// Mock axios
jest.mock('axios', () => {
  const request = jest.fn();
  return {
    default: { request },
    request,
  };
});

const axiosModule = require('axios');
const axiosRequestMock = axiosModule.default.request as jest.Mock;

describe('AxiosExecutionAdapter', () => {
  let adapter: AxiosExecutionAdapter;
  let mockSpec: NormalizedSpec;
  let mockOperation: Operation;
  let mockEnv: EnvironmentConfig;

  beforeEach(() => {
    axiosRequestMock.mockReset();
    adapter = new AxiosExecutionAdapter(AxiosClient);
    
    mockSpec = {
      id: 'test-spec',
      title: 'Test API',
      operations: [],
    } as any;

    mockOperation = {
      id: 'op1',
      method: 'GET',
      path: '/users',
      tags: ['users'],
    } as Operation;

    mockEnv = {
      id: 'env1',
      specId: 'test-spec',
      name: 'test',
      baseUrl: 'https://api.test.com',
      defaultHeaders: { 'Content-Type': 'application/json' },
      createdAt: new Date().toISOString(),
    } as EnvironmentConfig;
  });

  test('should execute GET request successfully', async () => {
    axiosRequestMock.mockResolvedValue({
      status: 200,
      data: { users: [] },
      headers: {},
    });

    const result = await adapter.executeOperation(mockSpec, mockOperation, mockEnv);

    expect(result.status).toBe(200);
    expect(result.data).toEqual({ users: [] });
    expect(axiosRequestMock).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        url: 'https://api.test.com/users',
      })
    );
  });

  test('should apply path parameters', async () => {
    axiosRequestMock.mockResolvedValue({ status: 200, data: {}, headers: {} });

    const operationWithParams: Operation = {
      ...mockOperation,
      path: '/users/{userId}',
    } as Operation;

    await adapter.executeOperation(
      mockSpec,
      operationWithParams,
      mockEnv,
      {
        pathParams: { userId: '123' },
      }
    );

    expect(axiosRequestMock).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://api.test.com/users/123',
      })
    );
  });

  test('should apply query parameters', async () => {
    axiosRequestMock.mockResolvedValue({ status: 200, data: {}, headers: {} });

    await adapter.executeOperation(mockSpec, mockOperation, mockEnv, {
      queryParams: { page: '1', limit: '10' },
    });

    expect(axiosRequestMock).toHaveBeenCalledWith(
      expect.objectContaining({
        params: { page: '1', limit: '10' },
      })
    );
  });

  test('should apply bearer token authentication', async () => {
    axiosRequestMock.mockResolvedValue({ status: 200, data: {}, headers: {} });

    const envWithAuth: EnvironmentConfig = {
      ...mockEnv,
      authConfig: {
        type: 'bearer',
        token: 'test-token',
      },
    };

    await adapter.executeOperation(mockSpec, mockOperation, envWithAuth);

    expect(axiosRequestMock).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      })
    );
  });

  test('should apply basic authentication', async () => {
    axiosRequestMock.mockResolvedValue({ status: 200, data: {}, headers: {} });

    const envWithAuth: EnvironmentConfig = {
      ...mockEnv,
      authConfig: {
        type: 'basic',
        username: 'user',
        password: 'pass',
      },
    };

    await adapter.executeOperation(mockSpec, mockOperation, envWithAuth);

    const callArgs = axiosRequestMock.mock.calls[0][0];
    expect(callArgs.headers.Authorization).toMatch(/^Basic /);
  });

  test('should apply API key authentication in header', async () => {
    axiosRequestMock.mockResolvedValue({ status: 200, data: {}, headers: {} });

    const envWithAuth: EnvironmentConfig = {
      ...mockEnv,
      authConfig: {
        type: 'apikey',
        apiKey: 'test-key',
        apiKeyName: 'X-API-Key',
        apiKeyLocation: 'header',
      },
    };

    await adapter.executeOperation(mockSpec, mockOperation, envWithAuth);

    expect(axiosRequestMock).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: expect.objectContaining({
          'X-API-Key': 'test-key',
        }),
      })
    );
  });

  test('should apply API key authentication in query', async () => {
    axiosRequestMock.mockResolvedValue({ status: 200, data: {}, headers: {} });

    const envWithAuth: EnvironmentConfig = {
      ...mockEnv,
      authConfig: {
        type: 'apikey',
        apiKey: 'test-key',
        apiKeyName: 'api_key',
        apiKeyLocation: 'query',
      },
    };

    await adapter.executeOperation(mockSpec, mockOperation, envWithAuth);

    expect(axiosRequestMock).toHaveBeenCalledWith(
      expect.objectContaining({
        params: expect.objectContaining({
          api_key: 'test-key',
        }),
      })
    );
  });

  test('should merge default headers with override headers', async () => {
    axiosRequestMock.mockResolvedValue({ status: 200, data: {}, headers: {} });

    await adapter.executeOperation(mockSpec, mockOperation, mockEnv, {
      headers: { 'X-Custom': 'value' },
    });

    const callArgs = axiosRequestMock.mock.calls[0][0];
    expect(callArgs.headers['Content-Type']).toBe('application/json');
    expect(callArgs.headers['X-Custom']).toBe('value');
  });
});

describe('AxiosClient retry and error handling', () => {
  beforeEach(() => {
    axiosRequestMock.mockReset();
  });

  test('should retry on timeout', async () => {
    axiosRequestMock
      .mockRejectedValueOnce({ code: 'ECONNABORTED', message: 'timeout' })
      .mockResolvedValueOnce({
        status: 200,
        data: { success: true },
        headers: {},
      });

    const result = await AxiosClient.request({
      method: 'GET',
      url: 'https://api.test.com/test',
      maxRetries: 3,
    });

    expect(result.status).toBe(200);
    expect(axiosRequestMock).toHaveBeenCalledTimes(2);
  });

  test('should retry on 5xx errors', async () => {
    axiosRequestMock
      .mockResolvedValueOnce({
        status: 500,
        data: { error: 'Internal Server Error' },
        headers: {},
      })
      .mockResolvedValueOnce({
        status: 200,
        data: { success: true },
        headers: {},
      });

    const result = await AxiosClient.request({
      method: 'GET',
      url: 'https://api.test.com/test',
      maxRetries: 3,
    });

    expect(result.status).toBe(200);
    expect(axiosRequestMock).toHaveBeenCalledTimes(2);
  });

  test('should not retry on 4xx errors', async () => {
    axiosRequestMock.mockResolvedValueOnce({
      status: 404,
      data: { error: 'Not Found' },
      headers: {},
    });

    const result = await AxiosClient.request({
      method: 'GET',
      url: 'https://api.test.com/test',
      maxRetries: 3,
    });

    expect(result.status).toBe(404);
    expect(axiosRequestMock).toHaveBeenCalledTimes(1);
  });
});
