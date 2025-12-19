import { EnvironmentConfig } from '../../domain/models/Environment';
import { EnvironmentRepository } from '../../domain/repositories/EnvironmentRepository';
import { SpecRepository } from '../../domain/repositories/SpecRepository';
import { CreateEnvironmentRequest } from '../../api/dto/environment.dto';
import NotFoundError from '../../core/errors/NotFoundError';

/**
 * Create Environment Use Case
 * Creates a new environment configuration for a spec
 */
export default async function createEnvironment(
  repo: EnvironmentRepository,
  specRepo: SpecRepository,
  payload: CreateEnvironmentRequest
): Promise<EnvironmentConfig> {
  // Verify spec exists
  const spec = await specRepo.get(payload.specId);
  if (!spec) {
    throw new NotFoundError(`Spec with id ${payload.specId} not found`);
  }

  const created = await repo.create(payload);
  return created;
}
