import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { InterviewType } from "../generated/prisma/enums";
import { Question, QuestionsService } from "./questions.service";

const INTERVIEW_TYPES = new Set<string>(Object.values(InterviewType));

function parseInterviewType(value?: string): InterviewType | undefined {
  if (value === undefined) return undefined;
  if (!INTERVIEW_TYPES.has(value)) {
    throw new BadRequestException(
      `interviewType must be one of ${[...INTERVIEW_TYPES].join(", ")}`,
    );
  }
  return value as InterviewType;
}

@Controller("questions")
@UseGuards(AuthGuard)
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get()
  async browse(
    @Query("interviewType") interviewType?: string,
    @Query("topic") topic?: string,
  ): Promise<Question[]> {
    return this.questionsService.browse({
      interviewType: parseInterviewType(interviewType),
      topic: topic || undefined,
    });
  }
}
