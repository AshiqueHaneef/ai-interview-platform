# NestJS gateway + stateless Python AI service

Two backend services, split at the AI boundary. NestJS owns auth, session lifecycle, all Postgres writes, and the client-facing WebSocket; a Python (FastAPI) service owns STT, LLM orchestration, TTS, and RAG retrieval, and is **stateless** — no database writes, no session state; every result flows back through NestJS for persistence.

## Considered options

- **Single NestJS service calling LLM APIs directly** — fewer moving parts, but forfeits the Python ML ecosystem (Whisper, HuggingFace) and the demonstrated cross-service orchestration this project exists to showcase.
- **Python also writes to Postgres (owns pgvector)** — saves a hop on retrieval, but splits data ownership across two services and doubles the migration/consistency surface.

## Consequences

- Exactly one interface contract between the services, defined early; changes to it are the expensive kind.
- Python can be scaled, restarted, or swapped freely — losing it loses no data.
- All pgvector queries go through NestJS, or are exposed to Python via the contract — never via a second DB connection.
