import { Controller, Get, Query, Req, UseGuards } from "@nestjs/common";
import { AuthenticatedRequest } from "../../common/types/auth-user";
import { AuthGuard } from "../auth/auth.guard";
import { ProgressService } from "./progress.service";
@Controller("api")
@UseGuards(AuthGuard)
export class ProgressController {
  constructor(private service: ProgressService) {}
  @Get("progress")
  progress(
    @Req() req: AuthenticatedRequest,
    @Query("userId") userId?: string,
    @Query("exerciseId") exerciseId?: string,
  ) {
    return this.service.progress(req.user, userId, exerciseId);
  }
}
