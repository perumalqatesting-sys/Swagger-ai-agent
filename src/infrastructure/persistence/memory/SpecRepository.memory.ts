import { v4 as uuidv4 } from "uuid";
import { NormalizedSpec } from "../../../domain/models/NormalizedSpec";

export class InMemorySpecRepository {
  private store: Map<string, NormalizedSpec> = new Map();

  async save(normalizedSpec: NormalizedSpec | any) {
    const id = (normalizedSpec && normalizedSpec.id) || uuidv4();
    const toSave = { ...normalizedSpec, id };
    this.store.set(id, toSave as NormalizedSpec);
    return toSave;
  }

  async get(id: string) {
    return this.store.get(id) || null;
  }

  async list() {
    return Array.from(this.store.values());
  }
}

export default InMemorySpecRepository;
