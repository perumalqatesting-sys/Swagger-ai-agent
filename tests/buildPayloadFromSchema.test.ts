import buildPayloadFromSchema from "../src/application/llm/buildPayloadFromSchema.usecase";
import { SpecRepository } from "../src/domain/repositories/SpecRepository";

const specWithBody = {
  id: 'spec1',
  operations: [
    {
      operationId: 'createUser',
      method: 'POST',
      path: '/users',
      requestBody: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
              },
              required: ['id', 'name'],
            },
          },
        },
      },
    },
  ],
};

describe("buildPayloadFromSchema use-case", () => {
  let specRepo: SpecRepository;

  beforeEach(() => {
    specRepo = {
      save: jest.fn(),
      list: jest.fn(),
      get: jest.fn().mockResolvedValue(specWithBody as any),
    } as any;
  });

  it("builds payload from schema only", async () => {
    const res = await buildPayloadFromSchema(specRepo, {
      specId: 'spec1',
      operationId: 'createUser',
      mode: 'schema-only',
    });

    expect(res.payloads[0]).toBeDefined();
    expect(res.source).toBe('schema');
  });

  it("throws when operation not found", async () => {
    (specRepo.get as jest.Mock).mockResolvedValue({ id: 'spec1', operations: [] });

    await expect(
      buildPayloadFromSchema(specRepo, {
        specId: 'spec1',
        operationId: 'missing',
      })
    ).rejects.toThrow(/not found/);
  });
});
