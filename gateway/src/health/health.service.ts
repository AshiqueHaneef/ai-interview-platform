import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { Pool } from "pg";

export type CheckResult = "up" | "down";

export interface HealthReport {
  status: "ok" | "degraded";
  checks: {
    db: CheckResult;
    aiService: CheckResult;
  };
}

const AI_SERVICE_TIMEOUT_MS = 2_000;

@Injectable()
export class HealthService implements OnModuleDestroy {
  private readonly pool = new Pool({
    connectionString:
      process.env.DATABASE_URL ??
      "postgres://postgres:postgres@localhost:5432/interview",
  });

  private readonly aiServiceUrl =
    process.env.AI_SERVICE_URL ?? "http://localhost:8000";

  async check(): Promise<HealthReport> {
    const [db, aiService] = await Promise.all([
      this.checkDb(),
      this.checkAiService(),
    ]);
    return {
      status: db === "up" && aiService === "up" ? "ok" : "degraded",
      checks: { db, aiService },
    };
  }

  private async checkDb(): Promise<CheckResult> {
    try {
      await this.pool.query("SELECT 1");
      return "up";
    } catch {
      return "down";
    }
  }

  private async checkAiService(): Promise<CheckResult> {
    try {
      const response = await fetch(`${this.aiServiceUrl}/health`, {
        signal: AbortSignal.timeout(AI_SERVICE_TIMEOUT_MS),
      });
      return response.ok ? "up" : "down";
    } catch {
      return "down";
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
}
