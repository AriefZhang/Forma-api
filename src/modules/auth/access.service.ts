import { ForbiddenException, Injectable } from "@nestjs/common";
import { AuthUser } from "../../common/types/auth-user";
import { uuid } from "../../common/validation";
import { DatabaseService } from "../../database/database.service";
@Injectable()
export class AccessService {
  constructor(private db: DatabaseService) {}
  async assertAccess(actor: AuthUser, userId: string) {
    uuid(userId);
    if (actor.sub === userId) return;
    if (
      actor.role === "TRAINER" &&
      (
        await this.db.query(
          "SELECT 1 FROM trainer_clients WHERE trainer_id=$1 AND client_id=$2 AND status='ACTIVE'",
          [actor.sub, userId],
        )
      ).length
    )
      return;
    throw new ForbiddenException("Tidak memiliki akses ke user ini");
  }
}
