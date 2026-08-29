import { Injectable } from "@nestjs/common";
import { Difficulty, InterviewType } from "../generated/prisma/enums";
import { PrismaService } from "../prisma/prisma.service";

export interface Question {
  slug: string;
  interviewType: InterviewType;
  prompt: string;
  topicTags: string[];
  difficulty: Difficulty;
}

export interface QuestionFilters {
  interviewType?: InterviewType;
  topic?: string;
}

@Injectable()
export class QuestionsService {
  constructor(private readonly prisma: PrismaService) {}

  /** The Rubric Hint is deliberately withheld: it steers scoring, and a
   *  Candidate browsing the Bank must not read what a strong answer covers. */
  async browse({ interviewType, topic }: QuestionFilters): Promise<Question[]> {
    return this.prisma.question.findMany({
      where: {
        ...(interviewType ? { interviewType } : {}),
          ...(topic ? { topicTags: { has: topic } } : {}),
        },
        select: {
          slug: true,
          interviewType: true,
          prompt: true,
          topicTags: true,
          difficulty: true,
        },
        orderBy: { slug: "asc" },
    });
  }
}
