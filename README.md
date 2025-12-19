## Swagger AI Agent (Phases 1–12)
Enterprise-grade Swagger/OpenAPI AI agent built with Node.js, TypeScript, Express, and Clean Architecture. Supports spec ingest, environment management, run planning/execution, test generation, LLM payloads, and MCP tools.

### Quick start
1) Copy `.env.example` → `.env` (set `LLM_API_KEY` if available).
2) Install: `npm install`
3) Dev: `npm run dev` (http://localhost:3000)
4) Tests: `npm test -- --runInBand`
5) Build: `npm run build`

### Key endpoints (under `/api`)
- Spec: `POST /spec/import`, `POST /spec/validate`, `GET /spec/:specId`, `GET /spec/:specId/operations`, `GET /spec/:specId/tags`, `GET /spec/:specId/environments`
- Environments: `POST /environments`, `GET /environments`, `GET /environments/:envId`, `PUT /environments/:envId`, `DELETE /environments/:envId`
- Execution: `POST /execution/plan`, `POST /execution/run` (plan+run or runId), `GET /execution/status/:runId`, `POST /execution/retry/:runId`
- TestGen: `POST /testgen/generate-axios-tests`, `GET /testgen/spec/:specId/preview`, `POST /testgen/export`
- LLM: `POST /llm/build-payload`
- MCP (swagger tools): `POST /mcp/swagger/list-operations`, `plan-run`, `execute-operation`, `generate-tests`
- Health: `GET /health`

### Phase progress (all implemented)
1. Bootstrap API skeleton, health check, baseline logging.
2. Spec ingest/normalize, in-memory spec repo.
3. CRUD for specs & environments (in-memory).
4. Spec operations discovery (list operations/tags).
5. Environment model refinements, spec-environment linkage.
6. Run planning (selection: single/tag/full) and RunPlan persistence.
7. Run execution with Axios adapter, step reporting.
8. Test generation (Axios + Jest code).
9. LLM payload builder (schema-first with optional LLM fill).
10. MCP tool surface for swagger operations/plan/exec/testgen.
11. Retry failed tests and run status aggregates.
12. Hardening: validation, rate limiting, larger JSON limit, retries/timeout/error mapping in AxiosClient, structured logging, unit tests.

### Project layout
- `src/core` — app/server bootstrap, middleware
- `src/config` — configuration
- `src/infrastructure` — logging, LLM adapters, Swagger loader/normalizer, HTTP client, persistence
- `src/domain` — domain models
- `src/application` — use-cases (spec, env, execution, llm, testgen)
- `src/api` — controllers, DTOs, validators, routes
- `examples/agent-minimal` — runnable example
- `tests` — unit tests for normalization, planning, execution, test generation, LLM client

### Notes
- Persistence is in-memory; swap with DB by implementing repositories under `src/infrastructure/persistence`.
- Postman collection: `postman_collection.json` (uses `{{baseUrl}}`, `{{specId}}`, `{{envId}}`, `{{runId}}`, `{{operationId}}`).
