import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

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
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

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
      await this.prisma.$queryRaw`SELECT 1`;
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
}
