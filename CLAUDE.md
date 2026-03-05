# CLAUDE.md

See [AGENTS.md](./AGENTS.md) for full project context, architecture, and coding guidelines.

## Session Notes (2026-03-05)

- Railway bot startup crash fixed by resolving migration ordering conflict:
  - Renamed `migrations/004_command_aliases.cjs` -> `migrations/007_command_aliases.cjs`.
  - Reason: production DB had `004_performance_indexes` applied while `004_command_aliases` was pending, which node-pg-migrate rejects as out-of-order.
- Deployment/runtime fix for Railway port binding:
  - API server now prefers `PORT` with `BOT_API_PORT` fallback in `src/api/server.js`.
  - Bot Docker healthcheck now targets `http://localhost:${PORT:-3001}/api/v1/health`.
