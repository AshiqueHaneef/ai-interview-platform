"use client";

import { useEffect, useState } from "react";

const GATEWAY_URL =
  process.env.NEXT_PUBLIC_GATEWAY_URL ?? "http://localhost:3001";

const POLL_INTERVAL_MS = 3_000;

type CheckResult = "up" | "down";

interface HealthReport {
  status: "ok" | "degraded";
  checks: {
    db: CheckResult;
    aiService: CheckResult;
  };
}

type StackStatus =
  | { kind: "loading" }
  | { kind: "gateway-unreachable" }
  | { kind: "reported"; report: HealthReport };

function useStackStatus(): StackStatus {
  const [status, setStatus] = useState<StackStatus>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const response = await fetch(`${GATEWAY_URL}/health`, {
          cache: "no-store",
        });
        const report = (await response.json()) as HealthReport;
        if (!cancelled) setStatus({ kind: "reported", report });
      } catch {
        if (!cancelled) setStatus({ kind: "gateway-unreachable" });
      }
    }

    void poll();
    const timer = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  return status;
}

function StatusCard({
  name,
  detail,
  state,
}: {
  name: string;
  detail: string;
  state: "up" | "down" | "unknown";
}) {
  const color =
    state === "up"
      ? "var(--up)"
      : state === "down"
        ? "var(--down)"
        : "var(--pending)";
  const label = state === "up" ? "Up" : state === "down" ? "Down" : "Unknown";

  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "20px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
      }}
    >
      <div>
        <div style={{ fontWeight: 600 }}>{name}</div>
        <div style={{ color: "var(--muted)", fontSize: 14, marginTop: 4 }}>
          {detail}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          aria-hidden
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: color,
            display: "inline-block",
          }}
        />
        <span style={{ color, fontWeight: 600, fontSize: 14 }}>{label}</span>
      </div>
    </div>
  );
}

export default function HomePage() {
  const status = useStackStatus();

  const gatewayState =
    status.kind === "loading"
      ? "unknown"
      : status.kind === "gateway-unreachable"
        ? "down"
        : "up";
  const dbState =
    status.kind === "reported" ? status.report.checks.db : "unknown";
  const aiState =
    status.kind === "reported" ? status.report.checks.aiService : "unknown";

  const headline =
    status.kind === "loading"
      ? "Checking stack…"
      : status.kind === "gateway-unreachable"
        ? "Gateway unreachable"
        : status.report.status === "ok"
          ? "All systems up"
          : "Stack degraded";

  return (
    <main
      style={{
        maxWidth: 640,
        margin: "0 auto",
        padding: "64px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >
      <header>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>
          AI Interview Platform
        </h1>
        <p style={{ color: "var(--muted)", marginTop: 8 }}>
          Walking skeleton — live system status, refreshed every{" "}
          {POLL_INTERVAL_MS / 1000}s.
        </p>
      </header>

      <div
        role="status"
        style={{
          fontSize: 18,
          fontWeight: 600,
          color:
            status.kind === "reported" && status.report.status === "ok"
              ? "var(--up)"
              : status.kind === "loading"
                ? "var(--pending)"
                : "var(--down)",
        }}
      >
        {headline}
      </div>

      <section
        style={{ display: "flex", flexDirection: "column", gap: 12 }}
        aria-label="Component status"
      >
        <StatusCard name="Web" detail="Next.js app (this page)" state="up" />
        <StatusCard
          name="Gateway"
          detail="NestJS API — auth, sessions, persistence"
          state={gatewayState}
        />
        <StatusCard
          name="Database"
          detail="Postgres, reported via gateway health check"
          state={dbState}
        />
        <StatusCard
          name="AI Service"
          detail="Python LLM orchestration, reported via gateway"
          state={aiState}
        />
      </section>
    </main>
  );
}
