import { Pool } from "pg";
import { migrations } from "./index";
export async function runMigrations(pool: Pool) {
  await pool.query(
    "CREATE TABLE IF NOT EXISTS schema_migrations(version integer PRIMARY KEY, applied_at timestamptz DEFAULT now())",
  );
  const connection = await pool.connect();
  try {
    await connection.query("BEGIN");
    await connection.query("LOCK TABLE schema_migrations IN EXCLUSIVE MODE");
    for (const migration of migrations) {
      const done = await connection.query(
        "SELECT 1 FROM schema_migrations WHERE version=$1",
        [migration.version],
      );
      if (!done.rows.length) {
        await connection.query(migration.sql);
        await connection.query(
          "INSERT INTO schema_migrations(version) VALUES($1)",
          [migration.version],
        );
      }
    }
    await connection.query("COMMIT");
  } catch (error) {
    await connection.query("ROLLBACK");
    throw error;
  } finally {
    connection.release();
  }
}
