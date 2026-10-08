import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AuthenticatedRequest } from "../../common/types/auth-user";
import { AuthGuard } from "../auth/auth.guard";
import { PlanInputDto, StartInputDto } from "./dto/plans.dto";
import { PlansService } from "./plans.service";
@Controller("api")
@UseGuards(AuthGuard)
export class PlansController {
  constructor(private service: PlansService) {}
  @Get("plans")
  plans(
    @Req() req: AuthenticatedRequest,
    @Query("userId") userId?: string,
    @Query("date") date?: string,
  ) {
    return this.service.plans(req.user, userId, date);
  }
  @Post("plans")
  create(@Req() req: AuthenticatedRequest, @Body() input: PlanInputDto) {
    return this.service.create(req.user, input);
  }
  @Put("plans/:id")
  update(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() input: PlanInputDto,
  ) {
    return this.service.update(req.user, id, input);
  }
  @Delete("plans/:id")
  remove(@Req() req: AuthenticatedRequest, @Param("id") id: string) {
    return this.service.remove(req.user, id);
  }
  @Post("plans/:id/start")
  start(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() input: StartInputDto,
  ) {
    return this.service.start(req.user, id, input);
  }
}
