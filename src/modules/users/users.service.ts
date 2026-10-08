import { Injectable } from "@nestjs/common";
import { AuthUser } from "../../common/types/auth-user";
import { DatabaseService } from "../../database/database.service";

@Injectable()
export class UsersService {
  constructor(private db: DatabaseService) {}
  async me(actor: AuthUser) {
    const [user] = await this.db.query(
      "SELECT id,name,email,role FROM users WHERE id=$1",
      [actor.sub],
    );
    return user;
  }
}
