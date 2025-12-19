import ingestSwagger from "../../src/application/spec/ingestSwagger.usecase";
import { normalizeSpec } from "../../src/application/spec/normalizeSpec.usecase";
import validateSpecDocument from "../../src/application/spec/validateSpec.usecase";

// Minimal tests that run without external network by using file loader
describe("Spec usecases", () => {
  test("normalizeSpec handles simple OpenAPI object", async () => {
    const simple = { info: { title: "T", version: "1.0" }, paths: { "/ping": { get: { operationId: "ping", responses: { 200: { description: "ok" } } } } } };
    const normalized = (await import("../../src/infrastructure/swagger/OpenApiNormalizer")).default.normalize(simple);
    expect(normalized.title).toBe("T");
    expect(normalized.operations.length).toBeGreaterThan(0);
  });

  test("validateSpecDocument detects missing fields", () => {
    const res = validateSpecDocument({});
    expect(res.valid).toBe(false);
    expect(res.issues.length).toBeGreaterThan(0);
  });
});
