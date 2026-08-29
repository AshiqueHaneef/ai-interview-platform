import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

@Module({
  imports: [PrismaModule],
  controllers: [AuthController],
  providers: [AuthService],
  // AuthGuard resolves AuthService, so any module guarding its routes needs it.
  exports: [AuthService],
})
export class AuthModule {}
