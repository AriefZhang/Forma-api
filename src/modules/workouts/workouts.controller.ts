import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AuthenticatedRequest } from "../../common/types/auth-user";
import { AuthGuard } from "../auth/auth.guard";
import { ActualSetDto } from "./dto/actual-set.dto";
import { WorkoutInputDto } from "./dto/workouts.dto";
import { WorkoutsService } from "./workouts.service";
@Controller("api")
@UseGuards(AuthGuard)
export class WorkoutsController {
  constructor(private service: WorkoutsService) {}
  @Get("workouts")
  workouts(@Req() req: AuthenticatedRequest, @Query("userId") userId?: string) {
    return this.service.workouts(req.user, userId);
  }
  @Post("workouts")
  create(@Req() req: AuthenticatedRequest, @Body() input: WorkoutInputDto) {
    return this.service.create(req.user, input);
  }
  @Delete("workouts/:id")
  remove(@Req() req: AuthenticatedRequest, @Param("id") id: string) {
    return this.service.remove(req.user, id);
  }
  @Get("workouts/:id")
  get(@Req() req: AuthenticatedRequest, @Param("id") id: string) {
    return this.service.get(req.user, id);
  }
  @Patch("workout-sets/:id")
  actual(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() input: ActualSetDto,
  ) {
    return this.service.actual(req.user, id, input);
  }
  @Post("workouts/:id/complete")
  complete(@Req() req: AuthenticatedRequest, @Param("id") id: string) {
    return this.service.complete(req.user, id);
  }
}
