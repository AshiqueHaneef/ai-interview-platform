import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Fallback keeps `prisma generate` working where no env is set
    // (e.g. the Docker build stage) — generate never touches the DB.
    url:
      process.env.DATABASE_URL ??
      "postgres://postgres:postgres@localhost:5432/interview",
  },
});
