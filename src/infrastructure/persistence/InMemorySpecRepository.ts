import { v4 as uuidv4 } from "uuid";
import { NormalizedSpec } from "../../domain/models/NormalizedSpec";
import SpecRepository from "../../domain/repositories/SpecRepository";

/**
 * In-memory implementation of SpecRepository
 * Stores normalized specs in a simple Map keyed by specId.
 */
export class InMemorySpecRepository implements SpecRepository {
  private store: Map<string, NormalizedSpec> = new Map();

  async save(id: string, spec: NormalizedSpec): Promise<NormalizedSpec> {
    const specId = id || spec.id || uuidv4();
    const toSave: NormalizedSpec = { ...spec, id: specId };
    this.store.set(specId, toSave);
    return toSave;
  }

  async get(id: string): Promise<NormalizedSpec | null> {
    return this.store.get(id) || null;
  }

  async list(): Promise<NormalizedSpec[]> {
    return Array.from(this.store.values());
  }
}

export default InMemorySpecRepository;