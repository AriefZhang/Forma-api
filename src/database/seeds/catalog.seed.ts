import type { DatabaseService } from "../database.service";
import { exerciseCatalog, muscleCatalog } from "./exercise-catalog";
import { machineCatalog } from "./machine-catalog";

export async function seedCatalog(db: DatabaseService) {
  const client = await db.pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `INSERT INTO machines(id,name,name_en,image_svg,instructions,instructions_en)
       SELECT id,name,name_en,image_svg,instructions,instructions_en
       FROM jsonb_to_recordset($1::jsonb) AS entry(id text,name text,name_en text,image_svg text,instructions jsonb,instructions_en jsonb)
       ON CONFLICT(id) DO UPDATE SET name=EXCLUDED.name,name_en=EXCLUDED.name_en,
       image_svg=EXCLUDED.image_svg,instructions=EXCLUDED.instructions,instructions_en=EXCLUDED.instructions_en`,
      [JSON.stringify(machineCatalog)],
    );
    for (const [id, name] of muscleCatalog)
      await client.query(
        "INSERT INTO muscles VALUES ($1,$2,$3) ON CONFLICT DO NOTHING",
        [id, name, `/muscles/${id}.svg`],
      );
    await client.query(
      `INSERT INTO exercises(id,name,description,equipment,description_en)
      SELECT id,name,description,equipment,description_en FROM jsonb_to_recordset($1::jsonb)
      AS entry(id uuid,name text,description text,equipment text,description_en text)
      ON CONFLICT(id) DO UPDATE SET name=EXCLUDED.name,description=EXCLUDED.description,
      equipment=EXCLUDED.equipment,description_en=EXCLUDED.description_en`,
      [JSON.stringify(exerciseCatalog)],
    );
    const links = exerciseCatalog.flatMap((e) => [
      { exercise_id: e.id, muscle_id: e.primary, role: "PRIMARY" },
      ...e.secondary.map((muscle_id) => ({
        exercise_id: e.id,
        muscle_id,
        role: "SECONDARY",
      })),
    ]);
    const machineLinks = machineCatalog.flatMap((machine) =>
      machine.exerciseIds.map((exercise_id) => ({
        exercise_id,
        machine_id: machine.id,
      })),
    );
    await client.query(
      `UPDATE exercises SET machine_id=entry.machine_id FROM jsonb_to_recordset($1::jsonb)
       AS entry(exercise_id uuid,machine_id text) WHERE exercises.id=entry.exercise_id`,
      [JSON.stringify(machineLinks)],
    );
    await client.query(
      `INSERT INTO exercise_muscles(exercise_id,muscle_id,role)
      SELECT exercise_id,muscle_id,role FROM jsonb_to_recordset($1::jsonb)
      AS entry(exercise_id uuid,muscle_id text,role text)
      ON CONFLICT(exercise_id,muscle_id) DO UPDATE SET role=EXCLUDED.role`,
      [JSON.stringify(links)],
    );
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
