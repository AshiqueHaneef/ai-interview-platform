import "dotenv/config";
import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";

function requireAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    // Booting unsigned would let anyone forge a credential cookie.
    throw new Error("AUTH_SECRET is required — see .env.example");
  }
  return secret;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser(requireAuthSecret()));
  // Credentialed requests cannot use a wildcard origin.
  app.enableCors({
    origin: process.env.WEB_ORIGIN ?? "http://localhost:3000",
    credentials: true,
  });
  await app.listen(Number(process.env.PORT ?? 3001));
}

void bootstrap();
