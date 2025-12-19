# Swagger AI Agent — Phase 1 (in-memory)

This scaffold is a Phase-1 in-memory MVP for the Swagger AI Agent.

Quick start

1. Copy `.env.example` to `.env` and fill `LLM_API_KEY` if available.
2. Install deps:

```bash
npm install
```

3. Run in dev mode:

```bash
npm run dev
```

Project layout

- `src/core` — app and server bootstrap
- `src/config` — configuration
- `src/infrastructure` — logging, LLM adapters, swagger loader, http client, persistence
- `src/domain` — domain models
- `src/application` — use-cases (plan & execute)
- `src/api` — controllers and routes
- `examples/agent-minimal` — runnable example

This is a minimal scaffold to iterate quickly. Persistence is in-memory to keep Phase 1 simple; swap in Mongo/SQL later by implementing repository interfaces under `src/infrastructure/persistence`.
