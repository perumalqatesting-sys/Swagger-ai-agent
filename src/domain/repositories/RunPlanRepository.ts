import { RunPlan } from "../models/RunPlan";

export interface RunPlanRepository {
  save(plan: RunPlan): Promise<RunPlan>;
  get(id: string): Promise<RunPlan | null>;
  list(): Promise<RunPlan[]>;
  update(plan: RunPlan): Promise<RunPlan>;
}

export default RunPlanRepository;
