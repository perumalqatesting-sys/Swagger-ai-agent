import { EnvironmentConfig } from "../models/Environment";

/**
 * Environment Repository Interface
 * Defines the contract for environment persistence operations
 */
export interface EnvironmentRepository {
  /**
   * Create a new environment configuration
   */
  create(env: Partial<EnvironmentConfig>): Promise<EnvironmentConfig>;

  /**
   * Get an environment by ID
   */
  get(id: string): Promise<EnvironmentConfig | null>;

  /**
   * List all environments
   */
  list(): Promise<EnvironmentConfig[]>;

  /**
   * List all environments for a specific spec
   */
  listBySpecId(specId: string): Promise<EnvironmentConfig[]>;

  /**
   * Update an environment configuration
   */
  update(id: string, patch: Partial<EnvironmentConfig>): Promise<EnvironmentConfig | null>;

  /**
   * Delete an environment configuration
   */
  delete(id: string): Promise<boolean>;
}

export default EnvironmentRepository;

