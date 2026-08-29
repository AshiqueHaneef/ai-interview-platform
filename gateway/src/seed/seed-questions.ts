import "dotenv/config";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { Difficulty, InterviewType } from "../generated/prisma/enums";

const SEED_FILE = resolve(process.cwd(), "prisma/seed/questions.json");

interface SeedQuestion {
  slug: string;
  interviewType: InterviewType;
  prompt: string;
  topicTags: string[];
  difficulty: Difficulty;
  rubricHint: string;
}

const INTERVIEW_TYPES = new Set<string>(Object.values(InterviewType));
const DIFFICULTIES = new Set<string>(Object.values(Difficulty));

/** A malformed content file should fail the seed loudly, not write junk. */
function validate(entry: unknown, index: number): SeedQuestion {
  const where = `questions.json[${index}]`;
  const q = entry as Partial<SeedQuestion>;

  for (const field of ["slug", "prompt", "rubricHint"] as const) {
    if (typeof q[field] !== "string" || q[field]!.length === 0) {
      throw new Error(`${where}: ${field} must be a non-empty string`);
    }
  }
  if (!INTERVIEW_TYPES.has(q.interviewType as string)) {
    throw new Error(
      `${where}: interviewType must be one of ${[...INTERVIEW_TYPES].join(", ")}`,
    );
  }
  if (!DIFFICULTIES.has(q.difficulty as string)) {
    throw new Error(
      `${where}: difficulty must be one of ${[...DIFFICULTIES].join(", ")}`,
    );
  }
  if (!Array.isArray(q.topicTags) || q.topicTags.length === 0) {
    throw new Error(`${where}: topicTags must be a non-empty array`);
  }

  return q as SeedQuestion;
}

async function readSeedQuestions(): Promise<SeedQuestion[]> {
  const contents = JSON.parse(await readFile(SEED_FILE, "utf8")) as unknown[];
  const questions = contents.map(validate);

  const slugs = new Set(questions.map((question) => question.slug));
  if (slugs.size !== questions.length) {
    throw new Error("questions.json: slugs must be unique");
  }
  return questions;
}

async function main(): Promise<void> {
  const questions = await readSeedQuestions();
  const prisma = new PrismaClient({
    adapter: new PrismaPg({
      connectionString:
        process.env.DATABASE_URL ??
        "postgres://postgres:postgres@localhost:5432/interview",
    }),
  });

  try {
    // Upsert on the slug: re-running updates reworded Questions in place
    // rather than inserting a second copy.
    for (const question of questions) {
      await prisma.question.upsert({
        where: { slug: question.slug },
        create: question,
        update: question,
      });
    }
    const total = await prisma.question.count();
    console.log(
      `Seeded ${questions.length} Questions; Question Bank holds ${total}.`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
