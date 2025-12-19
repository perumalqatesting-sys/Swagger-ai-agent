/**
 * Test Generation DTOs
 * Data Transfer Objects for test generation endpoints
 */

import { SelectionMode } from '../../application/execution/planRun.usecase';

// ============================================================================
// Request DTOs
// ============================================================================

/**
 * Operation Selection Criteria
 */
export interface OperationSelection {
  mode: SelectionMode;
  operationId?: string;  // For 'single' mode
  tags?: string[];       // For 'tag' mode
}

/**
 * Test Generation Options
 */
export interface TestGenerationOptions {
  includeNegativeTests?: boolean;
  includeAuthTests?: boolean;
  includeBoundaryTests?: boolean;
}

/**
 * Request to generate Axios + Jest tests
 */
export interface GenerateAxiosTestsRequest {
  specId: string;
  selection: OperationSelection;
  options?: TestGenerationOptions;
}

// ============================================================================
// Response DTOs
// ============================================================================

/**
 * Test Case Metadata
 */
export interface TestCaseMetadata {
  operationId: string;
  method: string;
  path: string;
  testType: string;
  expectedStatus: number;
  description?: string;
}

/**
 * Response from generating Axios + Jest tests
 */
export interface GenerateAxiosTestsResponse {
  code: string;  // Generated Jest + Axios test file content
  tests: TestCaseMetadata[];  // Structured list of test cases
  summary: {
    totalTests: number;
    operations: number;
    testTypes: Record<string, number>;
  };
}

export default {};





