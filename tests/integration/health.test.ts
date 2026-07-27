import { describe, expect, it } from "vitest";

const GATEWAY_URL = process.env.GATEWAY_URL ?? "http://localhost:3001";

describe("gateway health", () => {
  it("reports the whole stack healthy when the stack is booted", async () => {
    const response = await fetch(`${GATEWAY_URL}/health`);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      status: "ok",
      checks: { db: "up", aiService: "up" },
    });
  });
});
