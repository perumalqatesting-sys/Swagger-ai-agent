import PayloadBuilderLlmClient, { PayloadHints } from '../../infrastructure/llm/PayloadBuilderLlmClient';
import { LLMClient } from '../../infrastructure/llm/LLMClient.interface';
import container from '../../core/container';
import { SpecRepository } from '../../domain/repositories/SpecRepository';
import NotFoundError from '../../core/errors/NotFoundError';
import { structuredLogger } from '../../infrastructure/logging/winston.logger';

/**
 * Build Payload From Schema Request
 */
export interface BuildPayloadRequest {
  specId: string;
  operationId: string;
  mode?: 'schema-only' | 'schema-with-llm';
  hints?: PayloadHints;
}

/**
 * Build Payload From Schema Response
 */
export interface BuildPayloadResponse {
  payloads: any[];  // One or more example request bodies
  source: 'schema' | 'llm' | 'mixed';
  fieldsGeneratedByLLM?: string[];
}

/**
 * Build Payload From Schema Use Case
 * 
 * Algorithm:
 * 1. Try to build payload purely from schema & examples
 * 2. Identify missing required fields with no examples
 * 3. Call PayloadBuilderLlmClient (which uses LLM) only for those fields/schemas
 * 
 * This ensures core execution logic can work even without LLM (LLM is a helper, not a dependency)
 */
export default async function buildPayloadFromSchema(
  specRepo: SpecRepository,
  request: BuildPayloadRequest,
  llmClient?: LLMClient | null
): Promise<BuildPayloadResponse> {
  // 1. Get spec and operation
  const spec = await specRepo.get(request.specId);
  if (!spec) {
    throw new NotFoundError(`Spec with id ${request.specId} not found`);
  }

  // Find the operation - check both operationId and method_path format
  const normalizedOps = spec.operations || [];
  let operation = normalizedOps.find((op: any) => op.operationId === request.operationId);
  
  if (!operation) {
    // Try matching by method_path format
    operation = normalizedOps.find((op: any) => 
      `${op.method}_${op.path}` === request.operationId ||
      `${op.method}${op.path}` === request.operationId
    );
  }

  if (!operation) {
    throw new NotFoundError(`Operation ${request.operationId} not found in spec ${request.specId}`);
  }

  // 2. Get request body schema
  const requestBody = operation.requestBody;
  if (!requestBody) {
    return {
      payloads: [],
      source: 'schema',
    };
  }

  // Extract JSON schema from request body
  const jsonContent = requestBody.content?.['application/json'];
  if (!jsonContent || !jsonContent.schema) {
    return {
      payloads: [],
      source: 'schema',
    };
  }

  const schema = jsonContent.schema;

  // 3. Build payload based on mode
  const mode = request.mode || 'schema-with-llm';
  const useLLM = mode === 'schema-with-llm';
  const startTime = Date.now();

  try {
    // Create payload builder with or without LLM
    const llmClientToUse = useLLM ? (llmClient || container.llmClient) : null;
    const builder = new PayloadBuilderLlmClient(llmClientToUse);

    // Build payload
    const payload = await builder.buildPayloadFromSchema(schema, request.hints);
    const durationMs = Date.now() - startTime;

    // Determine source
    let source: 'schema' | 'llm' | 'mixed' = 'schema';
    if (useLLM && llmClientToUse) {
      // Check if we actually used LLM (simplified check - if payload has complex values, likely used LLM)
      source = 'mixed'; // Could be enhanced to track which fields used LLM
      structuredLogger.logLlmCall('buildPayloadFromSchema', undefined, undefined, durationMs);
    }

    // Ensure payload is not null/undefined
    const finalPayload = payload || {};

    return {
      payloads: [finalPayload],
      source,
    };
  } catch (error: any) {
    const durationMs = Date.now() - startTime;
    structuredLogger.logLlmError('buildPayloadFromSchema', error, durationMs);
    throw error;
  }
}

// Export the simple function for backwards compatibility
export async function buildPayloadFromSchemaSimple(schema: any, hints?: PayloadHints) {
  const builder = new PayloadBuilderLlmClient();
  return builder.buildPayloadFromSchema(schema, hints);
}
