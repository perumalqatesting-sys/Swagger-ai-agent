import { v4 as uuidv4 } from 'uuid';
import { EnvironmentConfig } from '../../../domain/models/Environment';
import { EnvironmentRepository } from '../../../domain/repositories/EnvironmentRepository';

/**
 * In-Memory Implementation of EnvironmentRepository
 * Stores environments in a Map for development/testing
 */
export class InMemoryEnvironmentRepository implements EnvironmentRepository {
  private store: Map<string, EnvironmentConfig> = new Map();

  async create(env: Partial<EnvironmentConfig>): Promise<EnvironmentConfig> {
    if (!env.specId) {
      throw new Error('specId is required');
    }
    if (!env.baseUrl) {
      throw new Error('baseUrl is required');
    }
    if (!env.name) {
      throw new Error('name is required');
    }

    const id = env.id || uuidv4();
    const now = new Date().toISOString();
    const toSave: EnvironmentConfig = {
      id,
      specId: env.specId,
      name: env.name,
      baseUrl: env.baseUrl,
      defaultHeaders: env.defaultHeaders || {},
      authConfig: env.authConfig,
      createdAt: now,
      updatedAt: now,
    };
    this.store.set(id, toSave);
    return toSave;
  }

  async get(id: string): Promise<EnvironmentConfig | null> {
    return this.store.get(id) || null;
  }

  async list(): Promise<EnvironmentConfig[]> {
    return Array.from(this.store.values());
  }

  async listBySpecId(specId: string): Promise<EnvironmentConfig[]> {
    return Array.from(this.store.values()).filter(env => env.specId === specId);
  }

  async update(id: string, patch: Partial<EnvironmentConfig>): Promise<EnvironmentConfig | null> {
    const existing = this.store.get(id);
    if (!existing) return null;
    
    // Don't allow changing specId or id
    const { specId, id: envId, ...allowedPatch } = patch;
    
    const updated: EnvironmentConfig = {
      ...existing,
      ...allowedPatch,
      id: existing.id,
      specId: existing.specId, // Preserve specId
      updatedAt: new Date().toISOString(),
    };
    this.store.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.store.delete(id);
  }
}

export default InMemoryEnvironmentRepository;
