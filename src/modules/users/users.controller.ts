import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { AuthenticatedRequest } from "../../common/types/auth-user";
import { AuthGuard } from "../auth/auth.guard";
import { UsersService } from "./users.service";
@Controller("api")
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private service: UsersService) {}
  @Get("me")
  me(@Req() req: AuthenticatedRequest) {
    return this.service.me(req.user);
  }
}
