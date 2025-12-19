/**
 * Basic structural validator for normalized specs or raw OpenAPI documents.
 * Returns { valid: boolean, issues: Array<{ message: string, path?: string }> }
 */
export function validateSpecDocument(doc: any) {
  const issues: Array<{ message: string; path?: string }> = [];
  if (!doc) {
    issues.push({ message: "document is empty" });
    return { valid: false, issues };
  }

  // Basic checks for OpenAPI/Swagger
  if (doc.openapi) {
    // OpenAPI 3.x
    if (!doc.info) issues.push({ message: "missing info object" });
    if (!doc.paths) issues.push({ message: "missing paths object" });
  } else if (doc.swagger) {
    // Swagger 2.0
    if (!doc.info) issues.push({ message: "missing info object" });
    if (!doc.paths) issues.push({ message: "missing paths object" });
  } else {
    issues.push({ message: "not an OpenAPI/Swagger document" });
  }

  // If normalized shape
  if (doc.operations) {
    if (!Array.isArray(doc.operations)) issues.push({ message: "operations should be an array" });
  }

  return { valid: issues.length === 0, issues };
}

export default validateSpecDocument;
