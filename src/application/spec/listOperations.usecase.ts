/**
 * Return normalized operations for a given specId using the provided repository.
 */
export async function listOperations(specId: string, specRepo: { get(id: string): Promise<any> | Promise<any[]> }) {
  if (!specId) throw new Error("specId is required");
  const spec = await (specRepo as any).get ? await (specRepo as any).get(specId) : null;
  if (!spec) throw new Error("spec not found");
  const operations = spec.operations || [];
  // map to public view
  return operations.map((op: any) => ({
    operationId: op.operationId,
    method: op.method,
    path: op.path,
    tags: op.tags || [],
    summary: op.summary || "",
  }));
}

export default listOperations;
