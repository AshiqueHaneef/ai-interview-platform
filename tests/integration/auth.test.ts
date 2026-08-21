import { describe, expect, it } from "vitest";

const GATEWAY_URL = process.env.GATEWAY_URL ?? "http://localhost:3001";

const PASSWORD = "correct-horse-battery-staple";

// The stack keeps its data between runs, so every run needs fresh credentials.
function uniqueEmail(): string {
  return `candidate-${crypto.randomUUID()}@example.com`;
}

function signUp(email: string, password = PASSWORD): Promise<Response> {
  return fetch(`${GATEWAY_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

/** Replays whatever cookies a response issued, the way a browser would. */
function cookiesFrom(response: Response): string {
  return response.headers
    .getSetCookie()
    .map((cookie) => cookie.split(";")[0])
    .join("; ");
}

function fetchCurrentCandidate(cookie: string): Promise<Response> {
  return fetch(`${GATEWAY_URL}/auth/me`, { headers: { cookie } });
}

function logIn(email: string, password: string): Promise<Response> {
  return fetch(`${GATEWAY_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

describe("signing up", () => {
  it("creates a candidate account and returns their identity", async () => {
    const email = uniqueEmail();

    const response = await signUp(email);

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ id: expect.any(String), email });
  });

  it("leaves the new candidate authenticated", async () => {
    const email = uniqueEmail();
    const signUpResponse = await signUp(email);

    const response = await fetchCurrentCandidate(cookiesFrom(signUpResponse));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ id: expect.any(String), email });
  });

  it("refuses an email that already has an account", async () => {
    const email = uniqueEmail();
    await signUp(email);

    const response = await signUp(email);

    expect(response.status).toBe(409);
  });

  it("refuses credentials that are missing or too weak", async () => {
    const responses = await Promise.all([
      fetch(`${GATEWAY_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: PASSWORD }),
      }),
      signUp("not-an-email"),
      signUp(uniqueEmail(), "short"),
    ]);

    expect(responses.map((response) => response.status)).toEqual([
      400, 400, 400,
    ]);
  });

  it("keeps the credential out of reach of page scripts", async () => {
    const response = await signUp(uniqueEmail());

    expect(response.headers.getSetCookie()).toContainEqual(
      expect.stringMatching(/HttpOnly/i),
    );
  });
});

describe("logging in", () => {
  it("authenticates a returning candidate who gives the right password", async () => {
    const email = uniqueEmail();
    await signUp(email);

    const logInResponse = await logIn(email, PASSWORD);
    const response = await fetchCurrentCandidate(cookiesFrom(logInResponse));

    expect(logInResponse.status).toBe(200);
    expect(await response.json()).toEqual({ id: expect.any(String), email });
  });

  it("refuses a wrong password without authenticating anyone", async () => {
    const email = uniqueEmail();
    await signUp(email);

    const response = await logIn(email, "not-the-password");

    expect(response.status).toBe(401);
    expect(response.headers.getSetCookie()).toEqual([]);
  });

  it("refuses an email that was never signed up", async () => {
    const response = await logIn(uniqueEmail(), PASSWORD);

    expect(response.status).toBe(401);
  });
});

describe("logging out", () => {
  it("leaves the candidate unauthenticated afterwards", async () => {
    const credential = cookiesFrom(await signUp(uniqueEmail()));

    const logOutResponse = await fetch(`${GATEWAY_URL}/auth/logout`, {
      method: "POST",
      headers: { cookie: credential },
    });
    const response = await fetchCurrentCandidate(
      cookiesFrom(logOutResponse) || credential,
    );

    expect(logOutResponse.status).toBe(200);
    expect(response.status).toBe(401);
  });
});

describe("the current candidate", () => {
  it("is refused to a caller carrying no credentials", async () => {
    const response = await fetch(`${GATEWAY_URL}/auth/me`);

    expect(response.status).toBe(401);
  });

  it("is refused, not broken, by a malformed credential", async () => {
    const response = await fetchCurrentCandidate("credential=not-an-id");

    expect(response.status).toBe(401);
  });

  it("is refused to a caller who forged an unsigned credential", async () => {
    const { id } = await (await signUp(uniqueEmail())).json();

    const response = await fetchCurrentCandidate(`credential=${id}`);

    expect(response.status).toBe(401);
  });
});
