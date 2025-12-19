import { EnvironmentConfig } from '../../domain/models/Environment';
import { EnvironmentRepository } from '../../domain/repositories/EnvironmentRepository';
import { UpdateEnvironmentRequest } from '../../api/dto/environment.dto';

/**
 * Update Environment Use Case
 * Updates an existing environment configuration
 */
export default async function updateEnvironment(
  repo: EnvironmentRepository,
  id: string,
  patch: UpdateEnvironmentRequest
): Promise<EnvironmentConfig | null> {
  return repo.update(id, patch);
}
