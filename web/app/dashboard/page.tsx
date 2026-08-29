"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Candidate, fetchCurrentCandidate, logOut } from "../lib/gateway";

type View =
  | { kind: "checking" }
  | { kind: "authenticated"; candidate: Candidate };

export default function DashboardPage() {
  const router = useRouter();
  const [view, setView] = useState<View>({ kind: "checking" });

  useEffect(() => {
    let cancelled = false;

    void fetchCurrentCandidate().then((candidate) => {
      if (cancelled) return;
      if (candidate) {
        setView({ kind: "authenticated", candidate });
      } else {
        router.replace("/login");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (view.kind === "checking") {
    return (
      <main style={{ padding: "96px 24px", textAlign: "center" }}>
        <p style={{ color: "var(--muted)" }}>Checking your credentials…</p>
      </main>
    );
  }

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
      <header
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700 }}>Dashboard</h1>
          <p style={{ color: "var(--muted)", marginTop: 6, fontSize: 14 }}>
            Signed in as {view.candidate.email}
          </p>
        </div>
        <button
          type="button"
          onClick={async () => {
            await logOut();
            router.replace("/login");
          }}
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: "9px 14px",
            color: "var(--text)",
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Log out
        </button>
      </header>

      <section
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: "24px",
        }}
      >
        <h2 style={{ fontSize: 16, fontWeight: 600 }}>Your Sessions</h2>
        <p style={{ color: "var(--muted)", marginTop: 8, fontSize: 14 }}>
          Starting a Session, score trends, and Weak Areas arrive with the next
          issues. This shell exists to prove the app is behind auth.
        </p>
        <Link
          href="/questions"
          style={{
            display: "inline-block",
            marginTop: 16,
            color: "var(--text)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: "9px 14px",
            fontSize: 14,
            textDecoration: "none",
          }}
        >
          Browse the Question Bank →
        </Link>
      </section>
    </main>
  );
}
