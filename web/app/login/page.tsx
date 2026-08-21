"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { CredentialsAction, submitCredentials } from "../lib/gateway";

const COPY: Record<
  CredentialsAction,
  { title: string; submit: string; switchTo: string; prompt: string }
> = {
  login: {
    title: "Log in",
    submit: "Log in",
    switchTo: "signup",
    prompt: "No account yet?",
  },
  signup: {
    title: "Create your account",
    submit: "Sign up",
    switchTo: "login",
    prompt: "Already have an account?",
  },
};

export default function LoginPage() {
  const router = useRouter();
  const [action, setAction] = useState<CredentialsAction>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const copy = COPY[action];

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const outcome = await submitCredentials(action, email, password);
    if (outcome.ok) {
      router.replace("/dashboard");
      return;
    }

    setError(outcome.message);
    setSubmitting(false);
  }

  return (
    <main
      style={{
        maxWidth: 400,
        margin: "0 auto",
        padding: "96px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >
      <header>
        <h1 style={{ fontSize: 26, fontWeight: 700 }}>{copy.title}</h1>
        <p style={{ color: "var(--muted)", marginTop: 8, fontSize: 14 }}>
          Practice system-design and behavioral interviews.
        </p>
      </header>

      <form
        onSubmit={onSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 14 }}
      >
        <Field
          label="Email"
          type="email"
          value={email}
          autoComplete="email"
          onChange={setEmail}
        />
        <Field
          label="Password"
          type="password"
          value={password}
          autoComplete={
            action === "signup" ? "new-password" : "current-password"
          }
          onChange={setPassword}
        />

        {error && (
          <p role="alert" style={{ color: "var(--down)", fontSize: 14 }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          style={{
            marginTop: 4,
            padding: "12px 16px",
            borderRadius: 10,
            border: "none",
            background: submitting ? "var(--border)" : "var(--up)",
            color: submitting ? "var(--muted)" : "#062b1f",
            fontWeight: 700,
            fontSize: 15,
            cursor: submitting ? "default" : "pointer",
          }}
        >
          {submitting ? "Working…" : copy.submit}
        </button>
      </form>

      <p style={{ color: "var(--muted)", fontSize: 14 }}>
        {copy.prompt}{" "}
        <button
          type="button"
          onClick={() => {
            setAction(copy.switchTo as CredentialsAction);
            setError(null);
          }}
          style={{
            background: "none",
            border: "none",
            color: "var(--text)",
            textDecoration: "underline",
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          {copy.switchTo === "signup" ? "Sign up" : "Log in"}
        </button>
      </p>
    </main>
  );
}

function Field({
  label,
  type,
  value,
  autoComplete,
  onChange,
}: {
  label: string;
  type: string;
  value: string;
  autoComplete: string;
  onChange: (value: string) => void;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 13, color: "var(--muted)" }}>{label}</span>
      <input
        type={type}
        value={value}
        required
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          padding: "11px 13px",
          color: "var(--text)",
          fontSize: 15,
        }}
      />
    </label>
  );
}
