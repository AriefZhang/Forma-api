import { Module } from "@nestjs/common";
import { DatabaseModule } from "./database/database.module";
import { AuthModule } from "./modules/auth/auth.module";
import { ClientsModule } from "./modules/clients/clients.module";
import { ExercisesModule } from "./modules/exercises/exercises.module";
import { HealthModule } from "./modules/health/health.module";
import { PlansModule } from "./modules/plans/plans.module";
import { ProgressModule } from "./modules/progress/progress.module";
import { UsersModule } from "./modules/users/users.module";
import { WorkoutsModule } from "./modules/workouts/workouts.module";
@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    HealthModule,
    UsersModule,
    ClientsModule,
    ExercisesModule,
    PlansModule,
    WorkoutsModule,
    ProgressModule,
  ],
})
export class AppModule {}
