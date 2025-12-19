import { Operation } from './Operation';
import { TestCaseDefinition } from './TestCaseDefinition';

export type RunStepStatus = "pending" | "running" | "success" | "failed";

export interface RunStep {
  id: string;
  operationId: string;
  method: string;
  path: string;
  request?: any;
  response?: any;
  status: RunStepStatus;
  error?: any;
  startedAt?: string;
  finishedAt?: string;
}

export type RunStatus = "pending" | "running" | "completed" | "failed";

/**
 * Run Plan Model
 * Represents a planned test run with selected operations and test cases
 */
export interface RunPlan {
  /** Unique run identifier */
  runId: string;
  /** Spec ID this run belongs to */
  specId: string;
  /** Environment name (e.g., "dev", "qa", "stage", "prod") */
  envName: string;
  /** Selected operations to test */
  operations: Operation[];
  /** Test case definitions for each operation */
  testCaseDefinitions: TestCaseDefinition[];
  /** Legacy: Run status */
  status: RunStatus;
  /** Legacy: Run steps (for backwards compatibility) */
  steps?: RunStep[];
  /** Created timestamp */
  createdAt: string;
  /** Updated timestamp */
  updatedAt?: string;
  /** Additional metadata */
  meta?: Record<string, any>;
}

// Legacy alias for backwards compatibility
export interface LegacyRunPlan {
  id: string;
  specId?: string;
  name?: string;
  createdAt: string;
  updatedAt?: string;
  status: RunStatus;
  steps: RunStep[];
  meta?: Record<string, any>;
}

// Keep only the named interface exports for RunPlan and RunStep. Do not default-export.
