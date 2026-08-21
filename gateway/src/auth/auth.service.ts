import { ConflictException, Injectable } from "@nestjs/common";
import { compare, hash } from "bcryptjs";
import { PrismaService } from "../prisma/prisma.service";

const PASSWORD_HASH_ROUNDS = 12;

/** The authenticated person taking interviews — a User row, minus the secret. */
export interface Candidate {
  id: string;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async signUp(email: string, password: string): Promise<Candidate> {
    if (await this.prisma.user.findUnique({ where: { email } })) {
      throw new ConflictException("that email already has an account");
    }
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash: await hash(password, PASSWORD_HASH_ROUNDS),
      },
    });
    return { id: user.id, email: user.email };
  }

  /** Returns null for both an unknown email and a wrong password: the caller
   *  must not be able to tell which addresses have accounts. */
  async logIn(email: string, password: string): Promise<Candidate | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !(await compare(password, user.passwordHash))) {
      return null;
    }
    return { id: user.id, email: user.email };
  }

  async findById(id: string): Promise<Candidate | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? { id: user.id, email: user.email } : null;
  }
}
