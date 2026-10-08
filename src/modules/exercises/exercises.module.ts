import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../database/database.module";
import { AuthModule } from "../auth/auth.module";
import { ExercisesController } from "./exercises.controller";
import { ExercisesService } from "./exercises.service";
@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [ExercisesController],
  providers: [ExercisesService],
})
export class ExercisesModule {}
