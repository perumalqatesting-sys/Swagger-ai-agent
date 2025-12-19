/**
 * Compute tags and counts from a normalized spec.
 */
export async function listTags(specId: string, specRepo: { get(id: string): Promise<any> }) {
  if (!specId) throw new Error("specId is required");
  const spec = await specRepo.get(specId);
  if (!spec) throw new Error("spec not found");
  const ops = spec.operations || [];
  const map: Record<string, number> = {};
  for (const op of ops) {
    const tags = op.tags || [];
    if (!tags.length) map["(untagged)"] = (map["(untagged)"] || 0) + 1;
    for (const t of tags) map[t] = (map[t] || 0) + 1;
  }
  return Object.entries(map).map(([tag, count]) => ({ tag, count }));
}

export default listTags;
