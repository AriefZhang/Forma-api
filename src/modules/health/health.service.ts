import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../database/database.service";

@Injectable()
export class HealthService {
  constructor(private db: DatabaseService) {}
  async health() {
    await this.db.query("SELECT 1");
    return { status: "ok" };
  }
}
