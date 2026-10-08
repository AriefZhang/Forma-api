import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../database/database.module";
import { AuthModule } from "../auth/auth.module";
import { PlansController } from "./plans.controller";
import { PlansService } from "./plans.service";
@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [PlansController],
  providers: [PlansService],
})
export class PlansModule {}
