import { Controller, Get } from "@nestjs/common";
import { HealthService } from "./health.service";
@Controller("api")
export class HealthController {
  constructor(private service: HealthService) {}
  @Get("health")
  health() {
    return this.service.health();
  }
}
