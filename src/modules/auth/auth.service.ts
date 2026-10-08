import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { randomUUID } from "node:crypto";
import { DatabaseService } from "../../database/database.service";
import { CredentialsDto, RegisterDto } from "./dto/auth.dto";
import { hashPassword, verifyPassword } from "./password";

@Injectable()
export class AuthService {
  constructor(
    private db: DatabaseService,
    private jwt: JwtService,
  ) {}
  async register(input: RegisterDto) {
    const id = randomUUID();
    try {
      await this.db.query(
        "INSERT INTO users(id,name,email,password_hash,role) VALUES($1,$2,$3,$4,$5)",
        [
          id,
          input.name,
          input.email.toLowerCase(),
          hashPassword(input.password),
          input.role,
        ],
      );
    } catch (e: any) {
      if (e.code === "23505")
        throw new BadRequestException("Email sudah terdaftar");
      throw e;
    }
    return this.session({
      id,
      name: input.name,
      email: input.email.toLowerCase(),
      role: input.role,
    });
  }
  async login(input: CredentialsDto) {
    const [user] = await this.db.query("SELECT * FROM users WHERE email=$1", [
      input.email.toLowerCase(),
    ]);
    if (!user || !verifyPassword(input.password, user.password_hash))
      throw new UnauthorizedException("Email atau password salah");
    const { password_hash, ...profile } = user;
    return this.session(profile);
  }
  private async session(user: any) {
    return {
      user,
      token: await this.jwt.signAsync({ sub: user.id, role: user.role }),
    };
  }
}
