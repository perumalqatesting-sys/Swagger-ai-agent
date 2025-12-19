import OpenApiNormalizer from "../../infrastructure/swagger/OpenApiNormalizer";

/**
 * Normalize a parsed OpenAPI/Swagger document into the application's NormalizedSpec shape.
 * Keeps domain logic out of controllers; pure transformation function.
 */
export function normalizeSpec(parsedDoc: any) {
  if (!parsedDoc) throw new Error("parsedDoc is required");
  const normalized = OpenApiNormalizer.normalize(parsedDoc);
  return normalized;
}

export default normalizeSpec;
