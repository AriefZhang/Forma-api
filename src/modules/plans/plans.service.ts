import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { AuthUser } from "../../common/types/auth-user";
import { uuid, validDate } from "../../common/validation";
import { DatabaseService } from "../../database/database.service";
import { AccessService } from "../auth/access.service";
import { PlanInputDto, StartInputDto } from "./dto/plans.dto";

@Injectable()
export class PlansService {
  constructor(
    private db: DatabaseService,
    private accessService: AccessService,
  ) {}
  async plans(actor: AuthUser, userId?: string, date?: string) {
    const owner = userId || actor.sub;
    await this.accessService.assertAccess(actor, owner);
    if (date && !validDate(date))
      throw new BadRequestException("Tanggal tidak valid");
    const plans = await this.db.query(
      `SELECT p.id,p.user_id,p.name,p.focus,to_char(p.scheduled_date,'YYYY-MM-DD') AS date,p.weekdays,
  (SELECT w.id FROM workouts w WHERE w.plan_id=p.id AND w.date=$2::date LIMIT 1) workout_id
  FROM plans p WHERE p.user_id=$1 AND ($2::date IS NULL OR p.scheduled_date=$2::date OR (p.scheduled_date<=$2::date AND extract(dow FROM $2::date)::integer=ANY(p.weekdays))) ORDER BY p.scheduled_date,p.created_at`,
      [owner, date || null],
    );
    for (const plan of plans)
      plan.exercises = await this.db.query(
        "SELECT pe.*,e.name FROM plan_exercises pe JOIN exercises e ON e.id=pe.exercise_id WHERE plan_id=$1 ORDER BY position",
        [plan.id],
      );
    return plans;
  }
  private async write(actor: AuthUser, input: PlanInputDto, id?: string) {
    await this.accessService.assertAccess(actor, input.userId);
    if (!validDate(input.date))
      throw new BadRequestException("Tanggal tidak valid");
    if (
      input.exercises.some(
        (e) => e.restSecondsBySet && e.restSecondsBySet.length !== e.sets,
      )
    )
      throw new BadRequestException("Rest time harus diisi untuk setiap set");
    if (
      new Set(input.exercises.map((e) => e.exerciseId)).size !==
      input.exercises.length
    )
      throw new BadRequestException("Latihan dalam plan tidak boleh duplikat");
    if (id) {
      const [old] = await this.db.query(
        "SELECT user_id FROM plans WHERE id=$1",
        [uuid(id)],
      );
      if (!old) throw new NotFoundException();
      await this.accessService.assertAccess(actor, old.user_id);
      if (old.user_id !== input.userId)
        throw new BadRequestException("Pemilik plan tidak bisa diganti");
    }
    const connection = await this.db.pool.connect();
    const planId = id || randomUUID();
    try {
      await connection.query("BEGIN");
      if (id) {
        await connection.query(
          "UPDATE plans SET name=$1,focus=$2,scheduled_date=$3,weekdays=$4 WHERE id=$5",
          [input.name, input.focus, input.date, input.weekdays, id],
        );
        await connection.query("DELETE FROM plan_exercises WHERE plan_id=$1", [
          id,
        ]);
      } else
        await connection.query(
          "INSERT INTO plans(id,user_id,created_by,name,focus,scheduled_date,weekdays) VALUES($1,$2,$3,$4,$5,$6,$7)",
          [
            planId,
            input.userId,
            actor.sub,
            input.name,
            input.focus,
            input.date,
            input.weekdays,
          ],
        );
      for (let i = 0; i < input.exercises.length; i++) {
        const e = input.exercises[i];
        await connection.query(
          "INSERT INTO plan_exercises(id,plan_id,exercise_id,position,target_sets,target_reps,target_weight,target_rir,rest_seconds,rest_seconds_by_set) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)",
          [
            randomUUID(),
            planId,
            e.exerciseId,
            i,
            e.sets,
            e.targetReps,
            e.targetWeight,
            e.targetRir,
            e.restSeconds,
            e.restSecondsBySet || Array(e.sets).fill(e.restSeconds),
          ],
        );
      }
      await connection.query("COMMIT");
      return { id: planId };
    } catch (e: any) {
      await connection.query("ROLLBACK");
      if (e.code === "23503")
        throw new BadRequestException("Latihan tidak ditemukan");
      throw e;
    } finally {
      connection.release();
    }
  }
  create(actor: AuthUser, input: PlanInputDto) {
    return this.write(actor, input);
  }
  update(actor: AuthUser, id: string, input: PlanInputDto) {
    return this.write(actor, input, id);
  }
  async remove(actor: AuthUser, id: string) {
    const [plan] = await this.db.query(
      "SELECT user_id FROM plans WHERE id=$1",
      [uuid(id)],
    );
    if (!plan) throw new NotFoundException();
    await this.accessService.assertAccess(actor, plan.user_id);
    await this.db.query("DELETE FROM plans WHERE id=$1", [id]);
    return { deleted: true };
  }
  async start(actor: AuthUser, id: string, input: StartInputDto) {
    uuid(id);
    if (!validDate(input.date))
      throw new BadRequestException("Tanggal tidak valid");
    const [plan] = await this.db.query("SELECT * FROM plans WHERE id=$1", [id]);
    if (!plan) throw new NotFoundException();
    await this.accessService.assertAccess(actor, plan.user_id);
    const scheduled = String(
      plan.scheduled_date instanceof Date
        ? plan.scheduled_date.toISOString().slice(0, 10)
        : plan.scheduled_date,
    );
    const dow = new Date(input.date + "T12:00:00Z").getUTCDay();
    if (
      scheduled !== input.date &&
      !(scheduled <= input.date && plan.weekdays.includes(dow))
    )
      throw new BadRequestException("Plan tidak terjadwal di tanggal ini");
    const c = await this.db.pool.connect();
    try {
      await c.query("BEGIN");
      await c.query("SELECT id FROM plans WHERE id=$1 FOR UPDATE", [id]);
      const existing = await c.query(
        "SELECT id FROM workouts WHERE plan_id=$1 AND date=$2",
        [id, input.date],
      );
      if (existing.rows.length) {
        await c.query("COMMIT");
        return { id: existing.rows[0].id };
      }
      const workoutId = randomUUID();
      await c.query(
        "INSERT INTO workouts(id,user_id,created_by,date,name,plan_id,status,focus) VALUES($1,$2,$3,$4,$5,$6,'IN_PROGRESS',$7)",
        [
          workoutId,
          plan.user_id,
          actor.sub,
          input.date,
          plan.name,
          id,
          plan.focus,
        ],
      );
      const { rows: exercises } = await c.query(
        "SELECT * FROM plan_exercises WHERE plan_id=$1 ORDER BY position",
        [id],
      );
      for (const e of exercises) {
        const entryId = randomUUID();
        await c.query(
          "INSERT INTO workout_exercises(id,workout_id,exercise_id,position) VALUES($1,$2,$3,$4)",
          [entryId, workoutId, e.exercise_id, e.position],
        );
        for (let n = 1; n <= e.target_sets; n++)
          await c.query(
            "INSERT INTO workout_sets(id,workout_exercise_id,set_number,reps,weight,target_reps,target_rir,rest_seconds) VALUES($1,$2,$3,NULL,$4,$5,$6,$7)",
            [
              randomUUID(),
              entryId,
              n,
              e.target_weight,
              e.target_reps,
              e.target_rir,
              e.rest_seconds_by_set[n - 1] ?? e.rest_seconds,
            ],
          );
      }
      await c.query("COMMIT");
      return { id: workoutId };
    } catch (e) {
      await c.query("ROLLBACK");
      throw e;
    } finally {
      c.release();
    }
  }
}
