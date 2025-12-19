import { EnvironmentConfig } from '../../domain/models/Environment';
import { EnvironmentRepository } from '../../domain/repositories/EnvironmentRepository';

/**
 * Get Environment Use Case
 * Retrieves a single environment by ID
 */
export default async function getEnvironment(
  repo: EnvironmentRepository,
  id: string
): Promise<EnvironmentConfig | null> {
  return repo.get(id);
}
