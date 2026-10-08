const { PGlite } = require("@electric-sql/pglite");
const { Test } = require("@nestjs/testing");
const { randomBytes } = require("node:crypto");
process.env.JWT_SECRET = randomBytes(32).toString("hex");
process.env.DATABASE_URL = "postgresql://unused:unused@localhost/preview";
require("reflect-metadata");
const { AppModule } = require("../dist/app.module");
const { DatabaseService } = require("../dist/database/database.service");
const { configureApp } = require("../dist/config/configure-app");
async function main() {
  const pg = new PGlite();
  await pg.waitReady;
  const db = new DatabaseService();
  await db.pool.end();
  const query = async (sql, args) =>
    sql.includes(";")
      ? (await pg.exec(sql), { rows: [] })
      : pg.query(sql, args);
  db.pool = {
    query,
    connect: async () => ({ query, release() {} }),
    end: async () => pg.close(),
  };
  const module = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(DatabaseService)
    .useValue(db)
    .compile();
  const app = module.createNestApplication();
  configureApp(
    app,
    new RegExp("^http://(localhost|127[.]0[.]0[.]1)(:[0-9]+)?$"),
  );
  await db.initialize();
  await app.listen(
    Number(process.env.PORT || 3000),
    process.env.HOST || "127.0.0.1",
  );
  console.log(
    "Disposable preview API port " +
      (process.env.PORT || 3000) +
      " — data resets on restart",
  );
  for (const signal of ["SIGINT", "SIGTERM"])
    process.on(signal, async () => {
      await app.close();
      process.exit(0);
    });
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
