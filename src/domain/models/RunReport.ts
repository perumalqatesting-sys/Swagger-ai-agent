import { RunPlan } from "./RunPlan";

export interface StepReport {
  stepId: string;
  status: "success" | "failed";
  startedAt?: string;
  finishedAt?: string;
  error?: any;
  response?: any;
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

export interface RunReport {
  runId: string;
  specId?: string;
  status: "completed" | "failed" | "running" | "pending";
  startedAt?: string;
  finishedAt?: string;
  steps: StepReport[];
  meta?: Record<string, any>;
  plan?: RunPlan;
  /** Aggregated status by tag */
  aggregatesByTag?: TagAggregate[];
  /** Aggregated status by HTTP method */
  aggregatesByMethod?: MethodAggregate[];
  /** Aggregated status by path */
  aggregatesByPath?: PathAggregate[];
}

export default RunReport;
