/**
 * LLM DTOs
 * Data Transfer Objects for LLM-assisted payload generation endpoints
 */

// ============================================================================
// Request DTOs
// ============================================================================

/**
 * Payload Hints
 * Additional context for LLM to generate more realistic payloads
 */
export interface PayloadHints {
  locale?: string;  // e.g., "IN", "US"
  domain?: string;  // e.g., "banking", "ecommerce"
  [key: string]: any;  // Allow additional hints
}

/**
 * Request to build payload from schema
 */
export interface BuildPayloadRequest {
  specId: string;
  operationId: string;
  mode?: 'schema-only' | 'schema-with-llm';
  hints?: PayloadHints;
}

// ============================================================================
// Response DTOs
// ============================================================================

/**
 * Response from building payload
 */
export interface BuildPayloadResponse {
  payloads: any[];  // One or more example request bodies
  source: 'schema' | 'llm' | 'mixed';
  fieldsGeneratedByLLM?: string[];
  operationId: string;
  specId: string;
}

export default {};





