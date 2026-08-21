import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import type { Request } from "express";
import { AuthService, Candidate } from "./auth.service";
import { CREDENTIAL_COOKIE } from "./credential.cookie";

export interface AuthenticatedRequest extends Request {
  candidate: Candidate;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    // Express sets signedCookies only when the signature verifies. A revoked
    // credential still arrives, emptied, so the shape is checked before the
    // value reaches a uuid column.
    const userId: unknown = request.signedCookies?.[CREDENTIAL_COOKIE];
    if (typeof userId !== "string" || !UUID_PATTERN.test(userId)) {
      throw new UnauthorizedException();
    }

    const candidate = await this.authService.findById(userId);
    if (!candidate) {
      throw new UnauthorizedException();
    }

    request.candidate = candidate;
    return true;
  }
}
