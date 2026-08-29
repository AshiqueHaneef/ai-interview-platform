"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Difficulty,
  fetchQuestions,
  InterviewType,
  Question,
} from "../lib/gateway";

const INTERVIEW_TYPE_LABELS: Record<InterviewType, string> = {
  system_design: "System Design",
  behavioral: "Behavioral",
};

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  junior: "#3fb950",
  mid: "#d29922",
  senior: "#f85149",
};

const CONTROL_STYLE = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 10,
  padding: "9px 12px",
  color: "var(--text)",
  fontSize: 14,
} as const;

type Load =
  | { kind: "loading" }
  | { kind: "loaded"; questions: Question[] }
  | { kind: "failed"; message: string };

export default function QuestionsPage() {
  const router = useRouter();
  const [interviewType, setInterviewType] = useState<InterviewType | "">("");
  const [topic, setTopic] = useState("");
  const [load, setLoad] = useState<Load>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    setLoad({ kind: "loading" });

    void fetchQuestions({ interviewType, topic }).then((outcome) => {
      if (cancelled) return;
      if (outcome.ok) {
        setLoad({ kind: "loaded", questions: outcome.questions });
      } else if (outcome.unauthenticated) {
        router.replace("/login");
      } else {
        setLoad({ kind: "failed", message: outcome.message });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [interviewType, topic, router]);

  // The topic vocabulary is whatever the Bank currently carries, so it grows
  // with the seed instead of being duplicated here.
  const [topics, setTopics] = useState<string[]>([]);
  useEffect(() => {
    void fetchQuestions({}).then((outcome) => {
      if (!outcome.ok) return;
      setTopics(
        [...new Set(outcome.questions.flatMap((q) => q.topicTags))].sort(),
      );
    });
  }, []);

  const summary = useMemo(() => {
    if (load.kind !== "loaded") return null;
    const count = load.questions.length;
    return `${count} ${count === 1 ? "Question" : "Questions"}`;
  }, [load]);

  return (
    <main
      style={{
        maxWidth: 780,
        margin: "0 auto",
        padding: "64px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >
      <header>
        <Link
          href="/dashboard"
          style={{ color: "var(--muted)", fontSize: 13, textDecoration: "none" }}
        >
          ← Dashboard
        </Link>
        <h1 style={{ fontSize: 26, fontWeight: 700, marginTop: 10 }}>
          Question Bank
        </h1>
        <p style={{ color: "var(--muted)", marginTop: 6, fontSize: 14 }}>
          Browse what a Session can draw from. {summary ?? ""}
        </p>
      </header>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <select
          aria-label="Interview Type"
          value={interviewType}
          onChange={(event) =>
            setInterviewType(event.target.value as InterviewType | "")
          }
          style={CONTROL_STYLE}
        >
          <option value="">All Interview Types</option>
          {Object.entries(INTERVIEW_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <select
          aria-label="Topic"
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
          style={CONTROL_STYLE}
        >
          <option value="">All topics</option>
          {topics.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>

        {(interviewType || topic) && (
          <button
            type="button"
            onClick={() => {
              setInterviewType("");
              setTopic("");
            }}
            style={{ ...CONTROL_STYLE, cursor: "pointer" }}
          >
            Clear filters
          </button>
        )}
      </div>

      {load.kind === "loading" && (
        <p style={{ color: "var(--muted)", fontSize: 14 }}>Loading…</p>
      )}

      {load.kind === "failed" && (
        <p style={{ color: "#f85149", fontSize: 14 }}>{load.message}</p>
      )}

      {load.kind === "loaded" && load.questions.length === 0 && (
        <p style={{ color: "var(--muted)", fontSize: 14 }}>
          No Question matches those filters.
        </p>
      )}

      {load.kind === "loaded" && (
        <ul
          style={{
            listStyle: "none",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {load.questions.map((question) => (
            <li
              key={question.slug}
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: 20,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  alignItems: "baseline",
                }}
              >
                <span style={{ color: "var(--muted)", fontSize: 12 }}>
                  {INTERVIEW_TYPE_LABELS[question.interviewType]}
                </span>
                <span
                  style={{
                    color: DIFFICULTY_COLORS[question.difficulty],
                    fontSize: 12,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: 0.4,
                  }}
                >
                  {question.difficulty}
                </span>
              </div>

              <p style={{ marginTop: 10, fontSize: 15, lineHeight: 1.5 }}>
                {question.prompt}
              </p>

              <div
                style={{
                  display: "flex",
                  gap: 6,
                  flexWrap: "wrap",
                  marginTop: 12,
                }}
              >
                {question.topicTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setTopic(tag)}
                    style={{
                      background: "transparent",
                      border: "1px solid var(--border)",
                      borderRadius: 999,
                      padding: "3px 10px",
                      color: "var(--muted)",
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
