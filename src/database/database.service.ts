import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { Pool, types } from "pg";
import { runMigrations } from "./migrations/migration-runner";
import { schema } from "./schema/initial-schema";
import { seedCatalog } from "./seeds/catalog.seed";
// Preserve calendar dates regardless of the server timezone.
types.setTypeParser(1082, (value) => value);
@Injectable()
export class DatabaseService implements OnModuleDestroy {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  async onModuleDestroy() {
    await this.pool.end();
  }
  async query(sql: string, args: unknown[] = []) {
    return (await this.pool.query(sql, args)).rows;
  }
  async migrate() {
    await runMigrations(this.pool);
  }
  async initialize() {
    await this.query(schema);
    await this.migrate();
    await seedCatalog(this);
  }
}
