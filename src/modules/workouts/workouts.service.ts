import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { AuthUser } from "../../common/types/auth-user";
import { uuid } from "../../common/validation";
import { DatabaseService } from "../../database/database.service";
import { AccessService } from "../auth/access.service";
import { ActualSetDto } from "./dto/actual-set.dto";
import { WorkoutInputDto } from "./dto/workouts.dto";

@Injectable()
export class WorkoutsService {
  constructor(
    private db: DatabaseService,
    private accessService: AccessService,
  ) {}
  async workouts(actor: AuthUser, userId?: string) {
    const owner = userId || actor.sub;
    if (!/^[0-9a-f-]{36}$/i.test(owner))
      throw new BadRequestException("User ID tidak valid");
    await this.accessService.assertAccess(actor, owner);
    const workouts = await this.db.query(
      "SELECT id,user_id,created_by,to_char(date,'YYYY-MM-DD') AS date,name,notes,created_at,status,focus,plan_id FROM workouts WHERE user_id=$1 ORDER BY workouts.date DESC,created_at DESC LIMIT 100",
      [owner],
    );
    for (const workout of workouts) {
      workout.exercises = await this.db.query(
        "SELECT we.id,we.exercise_id,e.name FROM workout_exercises we JOIN exercises e ON e.id=we.exercise_id WHERE workout_id=$1 ORDER BY position",
        [workout.id],
      );
      for (const exercise of workout.exercises)
        exercise.sets = await this.db.query(
          "SELECT id,set_number,reps,weight,target_reps,rir,failed,completed_at FROM workout_sets WHERE workout_exercise_id=$1 ORDER BY set_number",
          [exercise.id],
        );
    }
    return workouts;
  }
  async create(actor: AuthUser, input: WorkoutInputDto) {
    await this.accessService.assertAccess(actor, input.userId);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date))
      throw new BadRequestException("Gunakan tanggal YYYY-MM-DD");
    const connection = await this.db.pool.connect();
    const id = randomUUID();
    try {
      await connection.query("BEGIN");
      await connection.query(
        "INSERT INTO workouts(id,user_id,created_by,date,name,notes) VALUES($1,$2,$3,$4,$5,$6)",
        [id, input.userId, actor.sub, input.date, input.name, input.notes],
      );
      for (let i = 0; i < input.exercises.length; i++) {
        const exercise = input.exercises[i],
          entryId = randomUUID();
        await connection.query(
          "INSERT INTO workout_exercises VALUES($1,$2,$3,$4)",
          [entryId, id, exercise.exerciseId, i],
        );
        for (let j = 0; j < exercise.sets.length; j++) {
          const set = exercise.sets[j];
          await connection.query(
            "INSERT INTO workout_sets(id,workout_exercise_id,set_number,reps,weight,target_reps,completed_at) VALUES($1,$2,$3,$4,$5,$4,now())",
            [randomUUID(), entryId, j + 1, set.reps, set.weight],
          );
        }
      }
      await connection.query("COMMIT");
      return { id };
    } catch (e: any) {
      await connection.query("ROLLBACK");
      if (e.code === "23503")
        throw new BadRequestException("Latihan tidak ditemukan");
      throw e;
    } finally {
      connection.release();
    }
  }
  async remove(actor: AuthUser, id: string) {
    if (!/^[0-9a-f-]{36}$/i.test(id)) throw new BadRequestException();
    const [workout] = await this.db.query(
      "SELECT user_id FROM workouts WHERE id=$1",
      [id],
    );
    if (!workout) throw new NotFoundException();
    await this.accessService.assertAccess(actor, workout.user_id);
    await this.db.query("DELETE FROM workouts WHERE id=$1", [id]);
    return { deleted: true };
  }
  async session(actor: AuthUser, id: string) {
    const [w] = await this.db.query(
      "SELECT id,user_id,name,to_char(date,'YYYY-MM-DD') date,notes,status,focus FROM workouts WHERE id=$1",
      [uuid(id)],
    );
    if (!w) throw new NotFoundException();
    await this.accessService.assertAccess(actor, w.user_id);
    w.exercises = await this.db.query(
      "SELECT we.id,we.exercise_id,e.name FROM workout_exercises we JOIN exercises e ON e.id=we.exercise_id WHERE workout_id=$1 ORDER BY position",
      [id],
    );
    for (const e of w.exercises)
      e.sets = await this.db.query(
        "SELECT * FROM workout_sets WHERE workout_exercise_id=$1 ORDER BY set_number",
        [e.id],
      );
    return w;
  }
  get(actor: AuthUser, id: string) {
    return this.session(actor, id);
  }
  async actual(actor: AuthUser, id: string, input: ActualSetDto) {
    const [w] = await this.db.query(
      "SELECT w.user_id,w.id FROM workout_sets s JOIN workout_exercises e ON e.id=s.workout_exercise_id JOIN workouts w ON w.id=e.workout_id WHERE s.id=$1",
      [uuid(id)],
    );
    if (!w) throw new NotFoundException();
    await this.accessService.assertAccess(actor, w.user_id);
    const [set] = await this.db.query(
      "UPDATE workout_sets SET reps=$1,weight=$2,rir=$3,rest_seconds=COALESCE($4,rest_seconds),completed_at=now() WHERE id=$5 RETURNING *",
      [input.reps, input.weight, input.rir, input.restSeconds ?? null, id],
    );
    return set;
  }
  async complete(actor: AuthUser, id: string) {
    const w = await this.session(actor, id);
    if (w.exercises.some((e: any) => e.sets.some((s: any) => !s.completed_at)))
      throw new BadRequestException(
        "Catat semua set sebelum menyelesaikan sesi",
      );
    await this.db.query("UPDATE workouts SET status='COMPLETED' WHERE id=$1", [
      id,
    ]);
    return { id, status: "COMPLETED" };
  }
}
