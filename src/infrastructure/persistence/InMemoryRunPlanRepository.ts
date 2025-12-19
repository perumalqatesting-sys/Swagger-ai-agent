import { v4 as uuidv4 } from "uuid";
import { RunPlan } from "../../domain/models/RunPlan";
import { RunPlanRepository } from "../../domain/repositories/RunPlanRepository";

export class InMemoryRunPlanRepository implements RunPlanRepository {
  private store: Map<string, RunPlan> = new Map();

  async save(plan: RunPlan): Promise<RunPlan> {
    const id = plan.runId || uuidv4();
    const toSave: RunPlan = { ...plan, runId: id };
    this.store.set(id, toSave);
    return toSave;
  }

  async get(id: string): Promise<RunPlan | null> {
    return this.store.get(id) || null;
  }

  async list(): Promise<RunPlan[]> {
    return Array.from(this.store.values());
  }

  async update(plan: RunPlan): Promise<RunPlan> {
    const cur = this.store.get(plan.runId);
    if (!cur) {
      throw new Error(`Run plan with id ${plan.runId} not found`);
    }
    const updated: RunPlan = { ...cur, ...plan };
    this.store.set(plan.runId, updated);
    return updated;
  }
}

export default InMemoryRunPlanRepository;
