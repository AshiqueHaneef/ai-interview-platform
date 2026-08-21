export const GATEWAY_URL =
  process.env.NEXT_PUBLIC_GATEWAY_URL ?? "http://localhost:3001";

export interface Candidate {
  id: string;
  email: string;
}

export type CredentialsAction = "login" | "signup";

export type AuthOutcome =
  | { ok: true; candidate: Candidate }
  | { ok: false; message: string };

const FALLBACK_MESSAGE = "Something went wrong. Try again.";

// The credential is an httpOnly cookie on another origin, so every call has to
// opt in to sending it.
const CREDENTIALED: RequestInit = {
  credentials: "include",
  cache: "no-store",
};

async function readMessage(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json();
    const message = (body as { message?: unknown }).message;
    if (typeof message === "string") return message;
    if (Array.isArray(message) && typeof message[0] === "string") {
      return message[0];
    }
  } catch {
    // Fall through to the status-based message below.
  }
  return response.status === 401
    ? "Those credentials don't match an account."
    : FALLBACK_MESSAGE;
}

export async function submitCredentials(
  action: CredentialsAction,
  email: string,
  password: string,
): Promise<AuthOutcome> {
  let response: Response;
  try {
    response = await fetch(`${GATEWAY_URL}/auth/${action}`, {
      ...CREDENTIALED,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    return { ok: false, message: "Can't reach the gateway." };
  }

  if (!response.ok) {
    return { ok: false, message: await readMessage(response) };
  }
  return { ok: true, candidate: (await response.json()) as Candidate };
}

export async function fetchCurrentCandidate(): Promise<Candidate | null> {
  try {
    const response = await fetch(`${GATEWAY_URL}/auth/me`, CREDENTIALED);
    return response.ok ? ((await response.json()) as Candidate) : null;
  } catch {
    return null;
  }
}

export async function logOut(): Promise<void> {
  await fetch(`${GATEWAY_URL}/auth/logout`, {
    ...CREDENTIALED,
    method: "POST",
  });
}
