import { NormalizedSpec } from "../models/NormalizedSpec";

export interface SpecRepository {
  save(id: string, spec: NormalizedSpec): Promise<NormalizedSpec>;
  get(id: string): Promise<NormalizedSpec | null>;
  list(): Promise<NormalizedSpec[]>;
}

export default SpecRepository;
