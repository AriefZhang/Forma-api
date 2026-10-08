import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { AuthUser } from "../../common/types/auth-user";
import { DatabaseService } from "../../database/database.service";
import { LinkClientDto } from "./dto/clients.dto";

@Injectable()
export class ClientsService {
  constructor(private db: DatabaseService) {}
  async clients(actor: AuthUser) {
    return this.db.query(
      "SELECT u.id,u.name,u.email FROM users u JOIN trainer_clients t ON t.client_id=u.id WHERE t.trainer_id=$1 AND t.status='ACTIVE' ORDER BY u.name",
      [actor.sub],
    );
  }
  async addClient(actor: AuthUser, input: LinkClientDto) {
    if (actor.role !== "TRAINER") throw new ForbiddenException();
    const [client] = await this.db.query(
      "SELECT id,name,email FROM users WHERE email=$1 AND role='CLIENT'",
      [input.email.toLowerCase()],
    );
    if (!client)
      throw new NotFoundException("User dengan peran client belum terdaftar");
    await this.db.query(
      "INSERT INTO trainer_clients(trainer_id,client_id) VALUES($1,$2) ON CONFLICT DO NOTHING",
      [actor.sub, client.id],
    );
    return client;
  }
  async requests(actor: AuthUser) {
    return this.db.query(
      "SELECT u.id,u.name,u.email,t.status FROM trainer_clients t JOIN users u ON u.id=t.trainer_id WHERE t.client_id=$1 ORDER BY u.name",
      [actor.sub],
    );
  }
  async accept(actor: AuthUser, id: string) {
    if (!/^[0-9a-f-]{36}$/i.test(id)) throw new BadRequestException();
    const rows = await this.db.query(
      "UPDATE trainer_clients SET status='ACTIVE' WHERE trainer_id=$1 AND client_id=$2 RETURNING trainer_id",
      [id, actor.sub],
    );
    if (!rows.length) throw new NotFoundException();
    return { accepted: true };
  }
  async revoke(actor: AuthUser, id: string) {
    if (!/^[0-9a-f-]{36}$/i.test(id)) throw new BadRequestException();
    await this.db.query(
      "DELETE FROM trainer_clients WHERE trainer_id=$1 AND client_id=$2",
      [id, actor.sub],
    );
    return { deleted: true };
  }
}
