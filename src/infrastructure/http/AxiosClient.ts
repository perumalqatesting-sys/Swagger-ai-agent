export type RequestOptions = {
  method: string;
  url: string;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  data?: any;
  timeoutMs?: number;
  maxRetries?: number;
  retryDelayMs?: number;
};

export interface HttpResponse {
  status: number;
  data: any;
  headers: Record<string, string>;
}

export class HttpError extends Error {
  constructor(
    public statusCode: number,
    public response?: HttpResponse,
    message?: string
  ) {
    super(message || `HTTP ${statusCode}`);
    this.name = 'HttpError';
  }
}

export class TimeoutError extends Error {
  constructor(message?: string) {
    super(message || 'Request timeout');
    this.name = 'TimeoutError';
  }
}

export class NetworkError extends Error {
  constructor(message?: string, public originalError?: any) {
    super(message || 'Network error');
    this.name = 'NetworkError';
  }
}

export class AxiosClient {
  private static readonly DEFAULT_TIMEOUT_MS = 30000; // 30 seconds
  private static readonly DEFAULT_MAX_RETRIES = 3;
  private static readonly DEFAULT_RETRY_DELAY_MS = 1000; // 1 second
  private static readonly RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504];

  /**
   * Sleep for specified milliseconds
   */
  private static async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check if error is retryable
   */
  private static isRetryableError(err: any): boolean {
    // Network errors (no response)
    if (!err?.response && err?.code !== 'ECONNABORTED') {
      return true;
    }

    // Timeout errors
    if (err?.code === 'ECONNABORTED' || err?.message?.includes('timeout')) {
      return true;
    }

    // Retryable HTTP status codes
    if (err?.response?.status && this.RETRYABLE_STATUS_CODES.includes(err.response.status)) {
      return true;
    }

    return false;
  }

  /**
   * Map axios error to domain error
   */
  private static mapError(err: any): Error {
    // Timeout error
    if (err?.code === 'ECONNABORTED' || err?.message?.includes('timeout')) {
      return new TimeoutError(`Request timeout after ${err?.config?.timeout || this.DEFAULT_TIMEOUT_MS}ms`);
    }

    // HTTP error with response
    if (err?.response) {
      return new HttpError(
        err.response.status,
        {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers || {},
        },
        `HTTP ${err.response.status}: ${err.response.statusText || 'Error'}`
      );
    }

    // Network error (no response)
    if (err?.code === 'ENOTFOUND' || err?.code === 'ECONNREFUSED' || err?.code === 'ETIMEDOUT') {
      return new NetworkError(`Network error: ${err.message}`, err);
    }

    // Generic error
    return new NetworkError(err?.message || 'Unknown error', err);
  }

  /**
   * Make HTTP request with retries and error mapping
   */
  static async request(options: RequestOptions): Promise<HttpResponse> {
    const maxRetries = options.maxRetries ?? this.DEFAULT_MAX_RETRIES;
    const retryDelayMs = options.retryDelayMs ?? this.DEFAULT_RETRY_DELAY_MS;
    const timeoutMs = options.timeoutMs ?? this.DEFAULT_TIMEOUT_MS;

    let lastError: any = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const axios = await import('axios');
        const res = await axios.default.request({
          method: options.method as any,
          url: options.url,
          headers: options.headers,
          params: options.params,
          data: options.data,
          timeout: timeoutMs,
          validateStatus: () => true, // Don't throw on any status code
        });

        // Convert headers to Record<string, string>
        const headers: Record<string, string> = {};
        if (res.headers) {
          for (const [key, value] of Object.entries(res.headers)) {
            if (value !== undefined && value !== null) {
              headers[key] = String(value);
            }
          }
        }

        const response: HttpResponse = {
          status: res.status,
          data: res.data,
          headers,
        };

        // Retry on retryable HTTP status codes
        if (this.RETRYABLE_STATUS_CODES.includes(response.status) && attempt < maxRetries) {
          lastError = new HttpError(response.status, response, `HTTP ${response.status}`);
          const delay = retryDelayMs * Math.pow(2, attempt);
          await this.sleep(delay);
          continue;
        }

        return response;
      } catch (err: any) {
        lastError = err;

        // If this is the last attempt, throw mapped error
        if (attempt === maxRetries) {
          throw this.mapError(err);
        }

        // Check if error is retryable
        if (!this.isRetryableError(err)) {
          throw this.mapError(err);
        }

        // Wait before retrying (exponential backoff)
        const delay = retryDelayMs * Math.pow(2, attempt);
        await this.sleep(delay);
      }
    }

    // Should never reach here, but just in case
    throw this.mapError(lastError);
  }
}

export default AxiosClient;
