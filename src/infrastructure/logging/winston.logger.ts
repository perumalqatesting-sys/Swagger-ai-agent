import { createLogger, format, transports } from "winston";

const logger = createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.json()
  ),
  defaultMeta: { service: 'swagger-ai-agent' },
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
          return `${timestamp} [${level}]: ${message} ${metaStr}`;
        })
      )
    })
  ]
});

/**
 * Structured logging helpers for critical paths
 */
export const structuredLogger = {
  /**
   * Log spec ingestion
   */
  logSpecIngest: (specId: string, source: string, operationCount: number, durationMs?: number) => {
    logger.info('Spec ingested', {
      event: 'spec.ingest',
      specId,
      source,
      operationCount,
      durationMs,
    });
  },

  /**
   * Log spec ingestion error
   */
  logSpecIngestError: (source: string, error: any, durationMs?: number) => {
    logger.error('Spec ingestion failed', {
      event: 'spec.ingest.error',
      source,
      error: error?.message || String(error),
      stack: error?.stack,
      durationMs,
    });
  },

  /**
   * Log execution start
   */
  logExecutionStart: (runId: string, specId: string, envName: string, testCount: number) => {
    logger.info('Execution started', {
      event: 'execution.start',
      runId,
      specId,
      envName,
      testCount,
    });
  },

  /**
   * Log execution completion
   */
  logExecutionComplete: (runId: string, status: string, passed: number, failed: number, durationMs: number) => {
    logger.info('Execution completed', {
      event: 'execution.complete',
      runId,
      status,
      passed,
      failed,
      durationMs,
    });
  },

  /**
   * Log execution error
   */
  logExecutionError: (runId: string, error: any, stepId?: string) => {
    logger.error('Execution error', {
      event: 'execution.error',
      runId,
      stepId,
      error: error?.message || String(error),
      stack: error?.stack,
    });
  },

  /**
   * Log LLM call
   */
  logLlmCall: (operation: string, inputTokens?: number, outputTokens?: number, durationMs?: number) => {
    logger.info('LLM call', {
      event: 'llm.call',
      operation,
      inputTokens,
      outputTokens,
      durationMs,
    });
  },

  /**
   * Log LLM call error
   */
  logLlmError: (operation: string, error: any, durationMs?: number) => {
    logger.error('LLM call failed', {
      event: 'llm.error',
      operation,
      error: error?.message || String(error),
      stack: error?.stack,
      durationMs,
    });
  },

  /**
   * Log test generation
   */
  logTestGeneration: (specId: string, operationCount: number, testCount: number, durationMs?: number) => {
    logger.info('Test generation completed', {
      event: 'testgen.complete',
      specId,
      operationCount,
      testCount,
      durationMs,
    });
  },
};

export default logger;
