/**
 * Execution DTOs
 * Data Transfer Objects for execution/run planning endpoints
 */

// ============================================================================
// Request DTOs
// ============================================================================

/**
 * Operation Selection Mode
 */
export type SelectionMode = 'single' | 'tag' | 'full';

/**
 * Operation Selection Criteria
 */
export interface OperationSelection {
  mode: SelectionMode;
  operationId?: string;  // For 'single' mode
  tags?: string[];      // For 'tag' mode
}

/**
 * Request to plan a run
 */
export interface PlanRunRequest {
  specId: string;
  envName: string;
  selection: OperationSelection;
}

/**
 * Request to execute a run
 * Can either accept runId (execute existing plan) or specId/envName/selection (plan+run)
 */
export interface ExecuteRunRequest {
  runId?: string;  // Execute existing plan
  specId?: string; // Plan+run in one call
  envName?: string;
  selection?: OperationSelection;
}

/**
 * Request to get run status
 */
export interface GetRunStatusRequest {
  runId: string;
}

// ============================================================================
// Response DTOs
// ============================================================================

/**
 * Response from planning a run
 */
export interface PlanRunResponse {
  runId: string;
  specId: string;
  envName: string;
  operationCount: number;
  testCount: number;
}

/**
 * Response from executing a run
 */
export interface ExecuteRunResponse {
  runId: string;
  status: string;
  message: string;
  summary?: {
    total: number;
    passed: number;
    failed: number;
    errors: number;
  };
}

/**
 * Aggregated status by tag
 */
export interface TagAggregate {
  tag: string;
  total: number;
  success: number;
  failed: number;
  successRate: number;
}

/**
 * Aggregated status by HTTP method
 */
export interface MethodAggregate {
  method: string;
  total: number;
  success: number;
  failed: number;
  successRate: number;
}

/**
 * Aggregated status by path
 */
export interface PathAggregate {
  path: string;
  total: number;
  success: number;
  failed: number;
  successRate: number;
}

/**
 * Response from getting run status
 */
export interface RunStatusResponse {
  runId: string;
  specId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt?: string;
  finishedAt?: string;
  summary?: {
    total: number;
    passed: number;
    failed: number;
    errors: number;
  };
  steps?: Array<{
    stepId: string;
    status: string;
    startedAt?: string;
    finishedAt?: string;
    error?: any;
  }>;
  aggregatesByTag?: TagAggregate[];
  aggregatesByMethod?: MethodAggregate[];
  aggregatesByPath?: PathAggregate[];
}

/**
 * Response from retrying failed tests
 */
export interface RetryFailedTestResponse {
  runId: string;
  originalRunId: string;
  specId: string;
  envName: string;
  operationCount: number;
  testCount: number;
}

export default {};




