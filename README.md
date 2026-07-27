# AI Interview Platform

Real-time AI mock-interview practice: an LLM Interviewer conducts system-design
and behavioral Sessions over text, scores each Transcript against a fixed
Rubric, and tracks Weak Areas across Sessions. See `CONTEXT.md` for the domain
language and `docs/adr/` for architecture decisions.

## Architecture

Four components (ADR 0001):

- **web** — Next.js app: interview UI and dashboard (port 3000)
- **gateway** — NestJS: auth, Session lifecycle, all Postgres writes, client-facing API (port 3001)
- **ai-service** — Python/FastAPI: stateless LLM orchestration, no DB access (port 8000)
- **postgres** — the only datastore (port 5432)

## Run the stack

```sh
docker compose up --build
```

Then open http://localhost:3000 — the page shows live status for all four
components. The gateway's health check is at http://localhost:3001/health and
reports DB and AI-service reachability:

```json
{ "status": "ok", "checks": { "db": "up", "aiService": "up" } }
```

## Integration tests (seam 1)

The integration harness drives the gateway's client-facing HTTP API against the
booted stack, exactly as the web client would. With the stack running:

```sh
npm test --prefix tests/integration
```

(First time: `npm install --prefix tests/integration`.)

## Local development

Each component also runs directly:

- `gateway`: `npm install && npm run build && npm start` (needs `DATABASE_URL`, `AI_SERVICE_URL`)
- `ai-service`: `pip install -r requirements.txt && uvicorn app.main:app --port 8000`
- `web`: `npm install && npm run dev` (needs `NEXT_PUBLIC_GATEWAY_URL`, defaults to `http://localhost:3001`)
