import { EnvironmentConfig } from '../../domain/models/Environment';
import { EnvironmentRepository } from '../../domain/repositories/EnvironmentRepository';

/**
 * List Environments Use Case
 * Lists all environments, optionally filtered by specId
 */
export default async function listEnvironments(
  repo: EnvironmentRepository,
  specId?: string
): Promise<EnvironmentConfig[]> {
  if (specId) {
    return repo.listBySpecId(specId);
  }
  return repo.list();
}
