import { Controller, Get, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { ExercisesService } from "./exercises.service";
@Controller("api")
@UseGuards(AuthGuard)
export class ExercisesController {
  constructor(private service: ExercisesService) {}
  @Get("exercises")
  exercises() {
    return this.service.exercises();
  }
  @Get("focuses")
  focuses() {
    return this.service.focuses();
  }
}
