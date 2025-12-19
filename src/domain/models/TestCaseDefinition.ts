/**
 * Test Case Definition Model
 * Defines a test case to be executed for an operation
 */

export type TestCaseType = 
  | 'happy_path'           // Normal successful execution
  | 'validation_error'     // Invalid input validation
  | 'auth_error'           // Authentication/authorization failure
  | 'boundary_test'        // Edge cases (min/max values, empty strings, etc.)
  | 'negative_test';       // Invalid data types, missing required fields

export type PayloadStrategy = 
  | 'schema_defaults'      // Use schema defaults/examples
  | 'llm_generated'        // Generate using LLM
  | 'manual'               // Manually provided
  | 'empty';               // Empty/null payload

export interface TestCaseDefinition {
  id: string;
  operationId: string;      // Reference to the operation
  testType: TestCaseType;
  expectedStatus: number;  // Expected HTTP status code (e.g., 200, 400, 401)
  payloadStrategy: PayloadStrategy;
  payloadOverride?: any;   // Optional manual payload override
  description?: string;     // Human-readable description
  skip?: boolean;          // Whether to skip this test case
}

export default TestCaseDefinition;





