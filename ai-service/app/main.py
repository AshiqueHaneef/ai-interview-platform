"""AI service: stateless LLM orchestration behind the gateway (ADR 0001).

Walking skeleton: only the health endpoint exists so the gateway can verify
reachability. Interviewer and scoring endpoints arrive in later issues.
"""

from fastapi import FastAPI

app = FastAPI(title="ai-service")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "ai-service"}
