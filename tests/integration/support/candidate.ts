export const GATEWAY_URL = process.env.GATEWAY_URL ?? "http://localhost:3001";

const PASSWORD = "correct-horse-battery-staple";

/**
 * Signs up a fresh Candidate and returns the cookie header a browser would
 * replay. The stack keeps its data between runs, so each call needs a new
 * email.
 */
export async function authenticateCandidate(): Promise<string> {
  const response = await fetch(`${GATEWAY_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: `candidate-${crypto.randomUUID()}@example.com`,
      password: PASSWORD,
    }),
  });

  if (!response.ok) {
    throw new Error(`could not authenticate a Candidate: ${response.status}`);
  }
  return response.headers
    .getSetCookie()
    .map((cookie) => cookie.split(";")[0])
    .join("; ");
}
