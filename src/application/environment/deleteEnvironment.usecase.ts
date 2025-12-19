import { EnvironmentRepository } from '../../domain/repositories/EnvironmentRepository';

/**
 * Delete Environment Use Case
 * Deletes an environment configuration
 */
export default async function deleteEnvironment(
  repo: EnvironmentRepository,
  id: string
): Promise<boolean> {
  return repo.delete(id);
}
