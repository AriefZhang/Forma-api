import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { DatabaseModule } from "../../database/database.module";
import { AccessService } from "./access.service";
import { AuthController } from "./auth.controller";
import { AuthGuard } from "./auth.guard";
import { AuthService } from "./auth.service";
@Module({
  imports: [
    DatabaseModule,
    JwtModule.registerAsync({
      useFactory: () => {
        const secret = process.env.JWT_SECRET;
        if (!secret || secret.length < 32)
          throw new Error("JWT_SECRET minimal 32 karakter");
        return { secret, signOptions: { expiresIn: "8h" } };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, AccessService],
  exports: [AuthGuard, AccessService, JwtModule],
})
export class AuthModule {}
