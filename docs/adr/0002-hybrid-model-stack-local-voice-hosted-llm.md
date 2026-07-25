# Hybrid model stack: local voice, hosted free-tier LLM

STT and TTS run locally in the Python service (whisper.cpp for transcription, Piper for speech); the interviewer and scoring LLM is a hosted free-tier model (Groq Llama 3.3 70B, or Gemini Flash as fallback). All model access sits behind a provider interface in the Python service, so any piece can be swapped by configuration.

## Context

Fully-local was the first choice (zero API cost), but the dev machine is a 16 GB M4 MacBook Air: it runs Whisper excellently yet can only fit a ~8B LLM, whose shallow follow-up questions and unreliable structured-JSON scoring would undermine both the dogfooding value and the rubric engine. Hosted free tiers give a 70B-class interviewer at the same $0/month and keep the demo deployable (no GPU host needed).

## Consequences

- Voice quality/latency is hardware-dependent and offline-capable; interviewer quality depends on a third-party free tier (rate limits apply — the session flow must tolerate them).
- A fully-local mode remains a config switch, useful as a demonstration, not the default.
