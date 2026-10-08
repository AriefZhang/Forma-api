const { test } = require("node:test");
const assert = require("node:assert/strict");
const { PGlite } = require("@electric-sql/pglite");
const { Test } = require("@nestjs/testing");
process.env.JWT_SECRET = "integration-test-only-secret-at-least-32-characters";
process.env.DATABASE_URL = "postgresql://unused:unused@localhost/unused";
require("reflect-metadata");
const { AppModule } = require("../dist/app.module");
const { DatabaseService } = require("../dist/database/database.service");
const { configureApp } = require("../dist/config/configure-app");

test("auth, client access, transactional workouts, validation and deletion", async () => {
  const pg = new PGlite();
  await pg.waitReady;
  const db = new DatabaseService();
  await db.pool.end();
  db.pool = {
    query: async (sql, args) =>
      sql.includes(";")
        ? (await pg.exec(sql), { rows: [] })
        : pg.query(sql, args),
    connect: async () => ({
      query: async (sql, args) =>
        sql.includes(";")
          ? (await pg.exec(sql), { rows: [] })
          : pg.query(sql, args),
      release() {},
    }),
    end: async () => pg.close(),
  };
  const mod = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(DatabaseService)
    .useValue(db)
    .compile();
  const app = mod.createNestApplication({ logger: false });
  configureApp(app, ["http://localhost:8083", "http://127.0.0.1:8083"]);
  await db.initialize();
  await app.listen(0, "127.0.0.1");
  const base = await app.getUrl();
  async function call(path, method = "GET", body, token) {
    const response = await fetch(base + "/api/" + path, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: "Bearer " + token } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    return { status: response.status, data: await response.json() };
  }
  try {
    for (const origin of ["http://localhost:8083", "http://127.0.0.1:8083"]) {
      const preflight = await fetch(base + "/api/auth/register", {
        method: "OPTIONS",
        headers: {
          Origin: origin,
          "Access-Control-Request-Method": "POST",
          "Access-Control-Request-Headers":
            "content-type,authorization,ngrok-skip-browser-warning",
        },
      });
      assert.equal(preflight.status, 204);
      assert.equal(
        preflight.headers.get("access-control-allow-origin"),
        origin,
      );
      assert.match(
        preflight.headers.get("access-control-allow-methods"),
        /POST/,
      );
      assert.match(
        preflight.headers.get("access-control-allow-headers"),
        /Authorization/i,
      );
    }
    const deniedOrigin = await fetch(base + "/api/auth/register", {
      method: "OPTIONS",
      headers: {
        Origin: "https://unapproved.example.test",
        "Access-Control-Request-Method": "POST",
      },
    });
    assert.equal(deniedOrigin.headers.get("access-control-allow-origin"), null);
    const trainer = (
      await call("auth/register", "POST", {
        name: "Trainer",
        email: "trainer@example.test",
        password: "password-123",
        role: "TRAINER",
      })
    ).data;
    const client = (
      await call("auth/register", "POST", {
        name: "Client",
        email: "client@example.test",
        password: "password-123",
        role: "CLIENT",
      })
    ).data;
    const stranger = (
      await call("auth/register", "POST", {
        name: "Other",
        email: "other@example.test",
        password: "password-123",
        role: "CLIENT",
      })
    ).data;
    assert.ok(trainer.token);
    assert.ok(client.token);
    assert.deepEqual((await call("health")).data, { status: "ok" });
    assert.equal(
      (await call("me", "GET", undefined, client.token)).data.id,
      client.user.id,
    );
    const focuses = await call("focuses", "GET", undefined, client.token);
    assert.equal(focuses.status, 200);
    assert.deepEqual(
      focuses.data.find((focus) => focus.id === "chest").muscleIds,
      ["chest"],
    );
    assert.equal(
      (
        await call("auth/register", "POST", {
          name: "Duplicate",
          email: "client@example.test",
          password: "password-123",
          role: "CLIENT",
        })
      ).status,
      400,
    );
    assert.equal(
      (
        await call("auth/login", "POST", {
          email: "client@example.test",
          password: "wrong-pass",
        })
      ).status,
      401,
    );
    assert.equal(
      (
        await call("auth/login", "POST", {
          email: "client@example.test",
          password: "password-123",
        })
      ).status,
      201,
    );
    assert.equal((await call("workouts")).status, 401);
    assert.equal(
      (
        await call(
          "workouts?userId=" + client.user.id,
          "GET",
          undefined,
          trainer.token,
        )
      ).status,
      403,
    );
    assert.equal(
      (
        await call(
          "clients",
          "POST",
          { email: client.user.email },
          stranger.token,
        )
      ).status,
      403,
    );
    assert.equal(
      (
        await call(
          "clients",
          "POST",
          { email: client.user.email },
          trainer.token,
        )
      ).status,
      201,
    );
    assert.equal(
      (
        await call(
          "workouts?userId=" + client.user.id,
          "GET",
          undefined,
          trainer.token,
        )
      ).status,
      403,
    );
    assert.equal(
      (
        await call(
          "trainer-requests/" + trainer.user.id + "/accept",
          "POST",
          {},
          stranger.token,
        )
      ).status,
      404,
    );
    assert.equal(
      (
        await call(
          "trainer-requests/" + trainer.user.id + "/accept",
          "POST",
          {},
          client.token,
        )
      ).status,
      201,
    );
    const catalog = await call("exercises", "GET", undefined, client.token);
    assert.equal(
      (await call("clients", "GET", undefined, trainer.token)).data[0].id,
      client.user.id,
    );
    assert.equal(
      (await call("trainer-requests", "GET", undefined, client.token)).data[0]
        .status,
      "ACTIVE",
    );
    assert.equal(catalog.status, 200);
    assert.equal(catalog.data.length, 196);
    const machineExercises = catalog.data.filter((e) =>
      ["machine", "cable", "smith"].includes(e.equipment),
    );
    assert.equal(new Set(machineExercises.map((e) => e.machine?.id)).size, 28);
    for (const exercise of machineExercises) {
      assert.ok(exercise.machine);
      assert.ok(exercise.machine.imageSvg.startsWith("<svg"));
      assert.ok(exercise.machine.instructions.length >= 3);
      assert.equal(
        exercise.machine.instructions.length,
        exercise.machine.instructionsEn.length,
      );
      assert.equal(exercise.machine_id, exercise.machine.id);
    }
    assert.equal(
      catalog.data.find((e) => e.name === "Bench Press").machine,
      null,
    );
    assert.equal(
      catalog.data.find((e) => e.name === "Leg Press").machine.id,
      "leg-press",
    );
    assert.equal(
      catalog.data.find((e) => e.name === "Leg Press Calf Raise").machine.id,
      "leg-press",
    );
    assert.equal(new Set(catalog.data.map((e) => e.id)).size, 196);
    assert.equal(new Set(catalog.data.map((e) => e.name)).size, 196);
    assert.equal(new Set(catalog.data.map((e) => e.equipment)).size, 9);
    for (const exercise of catalog.data) {
      assert.ok(exercise.description.length > 20);
      assert.ok(exercise.description_en.length > 20);
      assert.equal(
        exercise.muscles.filter((m) => m.role === "PRIMARY").length,
        1,
      );
      assert.equal(
        new Set(exercise.muscles.map((m) => m.id)).size,
        exercise.muscles.length,
      );
    }
    assert.equal(
      catalog.data.find((e) => e.id === "00000000-0000-4000-8000-000000000001")
        .name,
      "Bench Press",
    );
    assert.ok(catalog.data[0].muscles.length);
    const body = {
      userId: client.user.id,
      date: "2026-10-03",
      name: "Chest day",
      notes: "Good session",
      exercises: [
        {
          exerciseId: catalog.data[0].id,
          sets: [
            { weight: 60, reps: 10 },
            { weight: 65, reps: 8 },
          ],
        },
      ],
    };
    assert.equal(
      (
        await call(
          "workouts",
          "POST",
          {
            ...body,
            exercises: [
              { ...body.exercises[0], sets: [{ weight: -1, reps: 0 }] },
            ],
          },
          trainer.token,
        )
      ).status,
      400,
    );
    const created = await call("workouts", "POST", body, trainer.token);
    assert.equal(created.status, 201);
    const history = await call("workouts", "GET", undefined, client.token);
    assert.equal(history.data.length, 1);
    assert.equal(history.data[0].date, "2026-10-03");
    assert.equal(history.data[0].exercises[0].sets.length, 2);
    assert.equal(Number(history.data[0].exercises[0].sets[1].weight), 65);
    assert.equal(
      (
        await call(
          "workouts?userId=" + client.user.id,
          "GET",
          undefined,
          stranger.token,
        )
      ).status,
      403,
    );
    assert.equal(
      (
        await call(
          "workouts/" + created.data.id,
          "DELETE",
          undefined,
          stranger.token,
        )
      ).status,
      403,
    );
    const invalid = {
      ...body,
      exercises: [
        {
          ...body.exercises[0],
          exerciseId: "00000000-0000-4000-8000-999999999999",
        },
      ],
    };
    assert.equal(
      (await call("workouts", "POST", invalid, client.token)).status,
      400,
    );
    assert.equal(
      (await call("workouts", "GET", undefined, client.token)).data.length,
      1,
    );
    assert.equal(
      (
        await call(
          "workouts/" + created.data.id,
          "DELETE",
          undefined,
          client.token,
        )
      ).status,
      200,
    );
    assert.equal(
      (await call("workouts", "GET", undefined, client.token)).data.length,
      0,
    );

    const exerciseId = catalog.data[0].id;
    const planBody = {
      userId: client.user.id,
      name: "Daily Chest",
      focus: "chest",
      date: "2026-10-03",
      weekdays: [1],
      exercises: [
        {
          exerciseId,
          sets: 3,
          targetReps: 12,
          targetWeight: 30,
          targetRir: 2,
          restSeconds: 90,
          restSecondsBySet: [30, 90, 180],
        },
      ],
    };
    assert.equal(
      (
        await call(
          "plans",
          "POST",
          {
            ...planBody,
            exercises: [{ ...planBody.exercises[0], restSeconds: 31 }],
          },
          trainer.token,
        )
      ).status,
      400,
    );
    assert.equal(
      (
        await call(
          "plans",
          "POST",
          {
            ...planBody,
            exercises: [{ ...planBody.exercises[0], restSecondsBySet: [30] }],
          },
          trainer.token,
        )
      ).status,
      400,
    );
    const planned = await call("plans", "POST", planBody, trainer.token);
    assert.equal(planned.status, 201);
    assert.equal(
      (
        await call(
          "plans/" + planned.data.id,
          "PUT",
          { ...planBody, name: "Updated Chest" },
          trainer.token,
        )
      ).status,
      200,
    );
    assert.equal(
      (await call("plans", "GET", undefined, client.token)).data[0].name,
      "Updated Chest",
    );
    assert.equal(
      (await call("plans/" + planned.data.id, "PUT", planBody, stranger.token))
        .status,
      403,
    );
    assert.equal(
      (
        await call(
          "plans?userId=" + client.user.id + "&date=2026-10-05",
          "GET",
          undefined,
          trainer.token,
        )
      ).data.length,
      1,
    );
    assert.equal(
      (
        await call(
          "plans?userId=" + client.user.id + "&date=2026-10-04",
          "GET",
          undefined,
          trainer.token,
        )
      ).data.length,
      0,
    );
    assert.equal(
      (
        await call(
          "plans/" + planned.data.id + "/start",
          "POST",
          { date: "2026-10-04" },
          client.token,
        )
      ).status,
      400,
    );
    const started = await call(
      "plans/" + planned.data.id + "/start",
      "POST",
      { date: "2026-10-03" },
      client.token,
    );
    assert.equal(started.status, 201);
    assert.equal(
      (
        await call(
          "plans/" + planned.data.id + "/start",
          "POST",
          { date: "2026-10-03" },
          client.token,
        )
      ).data.id,
      started.data.id,
    );
    assert.equal(
      (
        await call(
          "workouts/" + started.data.id + "/complete",
          "POST",
          {},
          client.token,
        )
      ).status,
      400,
    );
    const session = (
      await call("workouts/" + started.data.id, "GET", undefined, client.token)
    ).data;
    assert.deepEqual(
      session.exercises[0].sets.map((x) => x.rest_seconds),
      [30, 90, 180],
    );
    const sets = session.exercises[0].sets;
    assert.equal(
      (
        await call(
          "workout-sets/" + sets[0].id,
          "PATCH",
          { reps: 6, weight: 30, rir: 0 },
          stranger.token,
        )
      ).status,
      403,
    );
    assert.equal(
      (
        await call(
          "workout-sets/" + sets[0].id,
          "PATCH",
          { reps: 6, weight: 30, rir: 0, restSeconds: 31 },
          client.token,
        )
      ).status,
      400,
    );
    const failed = await call(
      "workout-sets/" + sets[0].id,
      "PATCH",
      { reps: 6, weight: 30, rir: 0, restSeconds: 60 },
      client.token,
    );
    assert.equal(failed.data.failed, true);
    assert.equal(failed.data.rest_seconds, 60);
    const reached = await call(
      "workout-sets/" + sets[1].id,
      "PATCH",
      { reps: 12, weight: 30, rir: 0 },
      client.token,
    );
    assert.equal(reached.data.failed, false);
    await call(
      "workout-sets/" + sets[2].id,
      "PATCH",
      { reps: 0, weight: 30, rir: 0 },
      client.token,
    );
    assert.equal(
      (
        await call(
          "workouts/" + started.data.id + "/complete",
          "POST",
          {},
          client.token,
        )
      ).status,
      201,
    );
    const progress = (
      await call(
        "progress?exerciseId=" + exerciseId,
        "GET",
        undefined,
        client.token,
      )
    ).data;
    assert.equal(progress[0].volume, 540);
    assert.equal(progress[0].failed_sets, 2);
    assert.equal(progress[0].avg_rir, 0);
    await call(
      "workout-sets/" + sets[0].id,
      "PATCH",
      { reps: 12, weight: 30, rir: 2 },
      client.token,
    );
    const corrected = (await call("progress", "GET", undefined, client.token))
      .data;
    assert.equal(corrected[0].volume, 720);
    assert.equal(corrected[0].failed_sets, 1);
    await db.initialize();
    assert.equal(
      (await call("progress", "GET", undefined, client.token)).data[0].volume,
      720,
    );
    await call("plans/" + planned.data.id, "DELETE", undefined, trainer.token);
    assert.equal(
      (
        await call(
          "workouts/" + started.data.id,
          "GET",
          undefined,
          client.token,
        )
      ).status,
      200,
    );
    assert.equal(
      (
        await call(
          "progress?userId=" + client.user.id,
          "GET",
          undefined,
          stranger.token,
        )
      ).status,
      403,
    );
    await call(
      "trainer-requests/" + trainer.user.id,
      "DELETE",
      undefined,
      client.token,
    );
    assert.equal(
      (
        await call(
          "workouts?userId=" + client.user.id,
          "GET",
          undefined,
          trainer.token,
        )
      ).status,
      403,
    );
  } finally {
    await app.close();
  }
});

test("migration preserves existing workout sets and applies only once", async () => {
  const pg = new PGlite();
  await pg.waitReady;
  const { schema } = require("../dist/database/schema/initial-schema");
  await pg.exec(schema);
  await pg.exec(`
 INSERT INTO users(id,name,email,password_hash,role) VALUES('10000000-0000-4000-8000-000000000001','Legacy','legacy@example.test','unused','CLIENT');
 INSERT INTO exercises(id,name) VALUES('10000000-0000-4000-8000-000000000002','Legacy exercise');
 INSERT INTO workouts(id,user_id,created_by,date,name) VALUES('10000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','2026-10-01','Legacy session');
 INSERT INTO workout_exercises VALUES('10000000-0000-4000-8000-000000000004','10000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000002',0);
 INSERT INTO workout_sets VALUES('10000000-0000-4000-8000-000000000005','10000000-0000-4000-8000-000000000004',1,8,40);
 `);
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
  try {
    await db.initialize();
    const [before] = await db.query("SELECT * FROM workout_sets");
    await db.query(
      "INSERT INTO exercises(id,name) VALUES('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Custom exercise')",
    );
    assert.equal(before.reps, 8);
    assert.equal(before.target_reps, 8);
    assert.equal(Number(before.weight), 40);
    assert.ok(before.completed_at);
    assert.equal(before.failed, false);
    await db.query(
      "UPDATE machines SET image_url='https://example.test/gym/leg-press.webp' WHERE id='leg-press'",
    );
    await db.initialize();
    const [after] = await db.query("SELECT * FROM workout_sets");
    assert.deepEqual(after, before);
    assert.equal((await db.query("SELECT * FROM exercises")).length, 198);
    assert.equal(
      (
        await db.query(
          "SELECT name FROM exercises WHERE id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'",
        )
      )[0].name,
      "Custom exercise",
    );
    assert.equal((await db.query("SELECT * FROM schema_migrations")).length, 3);
    assert.equal((await db.query("SELECT * FROM machines")).length, 28);
    assert.equal(
      (await db.query("SELECT image_url FROM machines WHERE id='leg-press'"))[0]
        .image_url,
      "https://example.test/gym/leg-press.webp",
    );
    await db.query("DELETE FROM machines WHERE id='leg-press'");
    assert.equal(
      (
        await db.query(
          "SELECT machine_id FROM exercises WHERE name='Leg Press'",
        )
      )[0].machine_id,
      null,
    );
  } finally {
    await db.onModuleDestroy();
  }
});

test("failed migration rolls back DDL and version before a successful retry", async () => {
  const pg = new PGlite();
  await pg.waitReady;
  const { schema } = require("../dist/database/schema/initial-schema");
  const {
    runMigrations,
  } = require("../dist/database/migrations/migration-runner");
  await pg.exec(schema);
  let failVersionWrite = true;
  const query = async (sql, args) => {
    if (failVersionWrite && sql.startsWith("INSERT INTO schema_migrations")) {
      throw new Error("simulated version write failure");
    }
    return sql.includes(";")
      ? (await pg.exec(sql), { rows: [] })
      : pg.query(sql, args);
  };
  const pool = { query, connect: async () => ({ query, release() {} }) };
  try {
    await assert.rejects(
      runMigrations(pool),
      /simulated version write failure/,
    );
    assert.equal(
      (await pg.query("SELECT to_regclass('public.plans') AS table_name"))
        .rows[0].table_name,
      null,
    );
    assert.equal(
      (await pg.query("SELECT count(*)::int AS total FROM schema_migrations"))
        .rows[0].total,
      0,
    );
    failVersionWrite = false;
    await runMigrations(pool);
    assert.equal(
      (await pg.query("SELECT version FROM schema_migrations")).rows[0].version,
      2,
    );
    assert.equal(
      (await pg.query("SELECT count(*)::int AS total FROM plans")).rows[0]
        .total,
      0,
    );
  } finally {
    await pg.close();
  }
});
