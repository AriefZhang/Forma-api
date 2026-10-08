import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CredentialsDto, RegisterDto } from "./dto/auth.dto";
@Controller("api")
export class AuthController {
  constructor(private service: AuthService) {}
  @Post("auth/register")
  register(@Body() input: RegisterDto) {
    return this.service.register(input);
  }
  @Post("auth/login")
  login(@Body() input: CredentialsDto) {
    return this.service.login(input);
  }
}
