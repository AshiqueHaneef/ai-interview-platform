import { BadRequestException } from "@nestjs/common";

export interface Credentials {
  email: string;
  password: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MINIMUM_PASSWORD_LENGTH = 8;

function readString(body: unknown, field: keyof Credentials): string {
  const value = (body as Partial<Record<keyof Credentials, unknown>>)?.[field];
  if (typeof value !== "string" || value.length === 0) {
    throw new BadRequestException(`${field} is required`);
  }
  return value;
}

/** Credentials good enough to open an account. */
export function parseNewCredentials(body: unknown): Credentials {
  const email = readString(body, "email").trim().toLowerCase();
  const password = readString(body, "password");

  if (!EMAIL_PATTERN.test(email)) {
    throw new BadRequestException("email must be a valid address");
  }
  if (password.length < MINIMUM_PASSWORD_LENGTH) {
    throw new BadRequestException(
      `password must be at least ${MINIMUM_PASSWORD_LENGTH} characters`,
    );
  }
  return { email, password };
}

/** Credentials offered at login: only shape is checked, never strength —
 *  judging an existing password's quality here would leak that it exists. */
export function parseOfferedCredentials(body: unknown): Credentials {
  return {
    email: readString(body, "email").trim().toLowerCase(),
    password: readString(body, "password"),
  };
}
