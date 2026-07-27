import { Controller, Get, Res } from "@nestjs/common";
import type { Response } from "express";
import { HealthReport, HealthService } from "./health.service";

@Controller("health")
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async getHealth(
    @Res({ passthrough: true }) res: Response,
  ): Promise<HealthReport> {
    const report = await this.healthService.check();
    res.status(report.status === "ok" ? 200 : 503);
    return report;
  }
}
