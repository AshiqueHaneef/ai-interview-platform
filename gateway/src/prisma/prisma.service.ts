import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const CONNECT_TIMEOUT_MS = 2_000;
const QUERY_TIMEOUT_MS = 2_000;

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor() {
    super({
      adapter: new PrismaPg({
        connectionString:
          process.env.DATABASE_URL ??
          "postgres://postgres:postgres@localhost:5432/interview",
        connectionTimeoutMillis: CONNECT_TIMEOUT_MS,
        query_timeout: QUERY_TIMEOUT_MS,
      }),
    });
    // No eager $connect: the gateway must boot (and report db: "down")
    // even when Postgres is unreachable.
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
