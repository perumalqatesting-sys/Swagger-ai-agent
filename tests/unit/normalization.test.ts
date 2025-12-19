import OpenApiNormalizer from '../../src/infrastructure/swagger/OpenApiNormalizer';

describe('OpenApiNormalizer', () => {
  describe('normalize', () => {
    test('should normalize simple OpenAPI 3.0 spec', () => {
      const openApi = {
        openapi: '3.0.0',
        info: {
          title: 'Test API',
          version: '1.0.0',
        },
        paths: {
          '/users': {
            get: {
              operationId: 'getUsers',
              summary: 'Get users',
              tags: ['users'],
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'array',
                        items: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      };

      const normalized = OpenApiNormalizer.normalize(openApi);

      expect(normalized).toBeDefined();
      expect(normalized.id).toBe('Test API-1.0.0');
      expect(normalized.title).toBe('Test API');
      expect(normalized.version).toBe('1.0.0');
      expect(normalized.operations).toHaveLength(1);
      expect(normalized.operations[0].operationId).toBe('getUsers');
      expect(normalized.operations[0].method).toBe('GET');
      expect(normalized.operations[0].path).toBe('/users');
      expect(normalized.operations[0].tags).toEqual(['users']);
    });

    test('should handle spec without title and version', () => {
      const openApi = {
        openapi: '3.0.0',
        info: {},
        paths: {},
      };

      const normalized = OpenApiNormalizer.normalize(openApi);

      expect(normalized).toBeDefined();
      expect(normalized.id).toBeDefined();
      expect(normalized.operations).toHaveLength(0);
    });

    test('should normalize multiple operations', () => {
      const openApi = {
        openapi: '3.0.0',
        info: { title: 'API', version: '1.0' },
        paths: {
          '/users': {
            get: {
              operationId: 'getUsers',
              responses: { '200': { description: 'OK' } },
            },
            post: {
              operationId: 'createUser',
              responses: { '201': { description: 'Created' } },
            },
          },
          '/posts': {
            get: {
              operationId: 'getPosts',
              responses: { '200': { description: 'OK' } },
            },
          },
        },
      };

      const normalized = OpenApiNormalizer.normalize(openApi);

      expect(normalized.operations).toHaveLength(3);
      expect(normalized.operations.map(op => op.operationId)).toEqual([
        'getUsers',
        'createUser',
        'getPosts',
      ]);
    });

    test('should handle servers array', () => {
      const openApi = {
        openapi: '3.0.0',
        info: { title: 'API', version: '1.0' },
        servers: [
          { url: 'https://api.example.com', description: 'Production' },
          'https://staging.example.com',
        ],
        paths: {},
      };

      const normalized = OpenApiNormalizer.normalize(openApi);

      expect(normalized.servers).toHaveLength(2);
      expect(normalized.servers?.[0].url).toBe('https://api.example.com');
      expect(normalized.servers?.[0].description).toBe('Production');
      expect(normalized.servers?.[1].url).toBe('https://staging.example.com');
    });

    test('should generate operationId if missing', () => {
      const openApi = {
        openapi: '3.0.0',
        info: { title: 'API', version: '1.0' },
        paths: {
          '/test': {
            get: {
              responses: { '200': { description: 'OK' } },
            },
          },
        },
      };

      const normalized = OpenApiNormalizer.normalize(openApi);

      expect(normalized.operations[0].operationId).toBe('GET_/test');
    });

    test('should handle parameters', () => {
      const openApi = {
        openapi: '3.0.0',
        info: { title: 'API', version: '1.0' },
        paths: {
          '/users/{id}': {
            get: {
              operationId: 'getUser',
              parameters: [
                {
                  name: 'id',
                  in: 'path',
                  required: true,
                  schema: { type: 'string' },
                },
              ],
              responses: { '200': { description: 'OK' } },
            },
          },
        },
      };

      const normalized = OpenApiNormalizer.normalize(openApi);

      expect(normalized.operations[0].parameters).toBeDefined();
      expect(normalized.operations[0].parameters?.length).toBe(1);
      expect(normalized.operations[0].parameters?.[0].name).toBe('id');
    });
  });
});


