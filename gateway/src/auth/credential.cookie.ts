import type { CookieOptions, Response } from "express";

/**
 * Named "credential" rather than "session": in this domain a Session is one
 * mock interview (see CONTEXT.md), never a login.
 */
export const CREDENTIAL_COOKIE = "credential";

const CREDENTIAL_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

function cookieOptions(): CookieOptions {
  const overHttps = process.env.WEB_ORIGIN?.startsWith("https://") ?? false;
  return {
    httpOnly: true,
    signed: true,
    sameSite: overHttps ? "none" : "lax",
    secure: overHttps,
    path: "/",
  };
}

/** Issues the credential that authenticates the candidate on later requests. */
export function issueCredential(response: Response, candidateId: string): void {
  response.cookie(CREDENTIAL_COOKIE, candidateId, {
    ...cookieOptions(),
    maxAge: CREDENTIAL_MAX_AGE_MS,
  });
}

export function revokeCredential(response: Response): void {
  response.clearCookie(CREDENTIAL_COOKIE, cookieOptions());
}
