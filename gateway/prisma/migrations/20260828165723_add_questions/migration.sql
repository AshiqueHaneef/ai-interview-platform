-- CreateEnum
CREATE TYPE "interview_type" AS ENUM ('system_design', 'behavioral');

-- CreateEnum
CREATE TYPE "difficulty" AS ENUM ('junior', 'mid', 'senior');

-- CreateTable
CREATE TABLE "questions" (
    "slug" TEXT NOT NULL,
    "interview_type" "interview_type" NOT NULL,
    "prompt" TEXT NOT NULL,
    "topic_tags" TEXT[],
    "difficulty" "difficulty" NOT NULL,
    "rubric_hint" TEXT NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("slug")
);

-- CreateIndex
CREATE INDEX "questions_interview_type_idx" ON "questions"("interview_type");
