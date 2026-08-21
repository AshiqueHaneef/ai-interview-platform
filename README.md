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

## Configuration

Each component reads a `.env` file; committed `.env.example` files carry
working local-dev values:

- `./.env` — Docker Compose variables (Postgres credentials, published ports)
- `gateway/.env` — `DATABASE_URL`, `AI_SERVICE_URL`, `PORT` for local (non-Docker) dev; also read by the Prisma CLI
- `web/.env` — `NEXT_PUBLIC_GATEWAY_URL` (build-time, used by the browser)

```sh
cp .env.example .env
cp gateway/.env.example gateway/.env
cp web/.env.example web/.env
```

`.env` files are gitignored and excluded from Docker images; inside Compose the
gateway gets container-network URLs from `docker-compose.yml` directly.

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

## Auth

Sign up or log in at http://localhost:3000/login; `/dashboard` is behind auth
and redirects there when the Candidate isn't authenticated. The gateway issues
a signed, httpOnly `credential` cookie (ADR 0003) and exposes:

| Route              | Purpose                                       |
| ------------------ | --------------------------------------------- |
| `POST /auth/signup` | Create an account and authenticate            |
| `POST /auth/login`  | Authenticate an existing Candidate            |
| `POST /auth/logout` | Revoke the credential                         |
| `GET /auth/me`      | The current Candidate, or 401                 |

`AUTH_SECRET` signs the cookie and is required — the gateway refuses to boot
without it. Generate one per environment with `openssl rand -hex 32`.
Schema changes run through Prisma: `npm run prisma:migrate --prefix gateway`.

## Integration tests (seam 1)

The integration harness drives the gateway's client-facing HTTP API against the
booted stack, exactly as the web client would. With the stack running:

```sh
npm test --prefix tests/integration
```

(First time: `npm install --prefix tests/integration`.)

## Database (Prisma)

The gateway uses [Prisma ORM](https://www.prisma.io) (v7, `@prisma/adapter-pg`
driver adapter). The schema lives in `gateway/prisma/schema.prisma` (no models
yet — the domain schema arrives with later issues). Common commands, run from
`gateway/`:

- `npm run prisma:generate` — regenerate the client (into `src/generated/prisma`, gitignored; `npm run build` does this automatically)
- `npm run prisma:migrate` — create/apply migrations once models exist

## Local development

Each component also runs directly (after the `.env` copy step above):

- `gateway`: `npm install && npm run build && npm start`
- `ai-service`: `pip install -r requirements.txt && uvicorn app.main:app --port 8000`
- `web`: `npm install && npm run dev`
