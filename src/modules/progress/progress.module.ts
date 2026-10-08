import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../database/database.module";
import { AuthModule } from "../auth/auth.module";
import { ProgressController } from "./progress.controller";
import { ProgressService } from "./progress.service";
@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [ProgressController],
  providers: [ProgressService],
})
export class ProgressModule {}
