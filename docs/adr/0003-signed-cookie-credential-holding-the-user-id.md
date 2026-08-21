# Signed cookie credential holding the user id

Authentication is an httpOnly, signed cookie named `credential` carrying only the user id; the gateway verifies the signature, then loads the User. Passwords are bcrypt hashes on the users table. The cookie is deliberately **not** called a session — in this domain a Session is one mock interview (`CONTEXT.md`), and reusing the word in the auth layer would poison the glossary at exactly the point where Sessions start being persisted.

## Considered options

- **JWT in a header, stored client-side** — the spec's other option (issue #1). Rejected: the browser has to store and attach the token, which puts it in reach of page scripts, and reload-survival becomes app code instead of something the browser does for free. Nothing in v1 needs stateless cross-service token verification.
- **A server-side credential table** — rows to look up and revoke. Rejected for now: it buys per-credential revocation that a single-user dogfooding app has no use for, at the cost of a table whose name would collide with Session vocabulary.

## Consequences

- Logging out clears the cookie; it cannot invalidate a credential already copied elsewhere. Acceptable while the user count is one — revocation means rotating `AUTH_SECRET`, which logs everyone out.
- `AUTH_SECRET` is required at boot: the gateway refuses to start without it rather than running with forgeable cookies.
- The credential is only as good as its transport. Locally it is `SameSite=Lax` over HTTP; when `WEB_ORIGIN` is https the cookie switches to `Secure` + `SameSite=None`, which is what the deployed split-origin demo (#13) needs.
- Because the cookie is cross-origin (web :3000, gateway :3001), CORS runs with an explicit origin and `credentials: true` — a wildcard origin is not allowed once credentials are in play.
- The WebSocket Session (#5) can authenticate from the same cookie on the upgrade request; no second mechanism is needed.
