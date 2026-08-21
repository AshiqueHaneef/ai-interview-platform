import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import type { Response } from "express";
import { AuthenticatedRequest, AuthGuard } from "./auth.guard";
import { AuthService, Candidate } from "./auth.service";
import { issueCredential, revokeCredential } from "./credential.cookie";
import { parseNewCredentials, parseOfferedCredentials } from "./credentials";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("signup")
  async signUp(
    @Body() body: unknown,
    @Res({ passthrough: true }) response: Response,
  ): Promise<Candidate> {
    const { email, password } = parseNewCredentials(body);
    const candidate = await this.authService.signUp(email, password);
    issueCredential(response, candidate.id);
    return candidate;
  }

  @Post("login")
  @HttpCode(200)
  async logIn(
    @Body() body: unknown,
    @Res({ passthrough: true }) response: Response,
  ): Promise<Candidate> {
    const { email, password } = parseOfferedCredentials(body);
    const candidate = await this.authService.logIn(email, password);
    if (!candidate) {
      throw new UnauthorizedException();
    }
    issueCredential(response, candidate.id);
    return candidate;
  }

  @Post("logout")
  @HttpCode(200)
  logOut(@Res({ passthrough: true }) response: Response): void {
    revokeCredential(response);
  }

  @Get("me")
  @UseGuards(AuthGuard)
  me(@Req() request: AuthenticatedRequest): Candidate {
    return request.candidate;
  }
}
