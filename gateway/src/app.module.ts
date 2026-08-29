import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { HealthModule } from "./health/health.module";
import { QuestionsModule } from "./questions/questions.module";

@Module({
  imports: [AuthModule, HealthModule, QuestionsModule],
})
export class AppModule {}
