import { Injectable } from "@nestjs/common";
import { AuthUser } from "../../common/types/auth-user";
import { uuid } from "../../common/validation";
import { DatabaseService } from "../../database/database.service";
import { AccessService } from "../auth/access.service";

@Injectable()
export class ProgressService {
  constructor(
    private db: DatabaseService,
    private accessService: AccessService,
  ) {}
  async progress(actor: AuthUser, userId?: string, exerciseId?: string) {
    const owner = userId || actor.sub;
    await this.accessService.assertAccess(actor, owner);
    if (exerciseId) uuid(exerciseId);
    return this.db.query(
      `SELECT * FROM (SELECT to_char(w.date,'YYYY-MM-DD') date,count(s.id)::int sets,
   coalesce(sum(s.reps*s.weight),0)::float volume,max(s.weight)::float max_weight,
   avg(s.rir)::float avg_rir,count(s.id) FILTER(WHERE s.failed)::int failed_sets
   FROM workouts w JOIN workout_exercises e ON e.workout_id=w.id JOIN workout_sets s ON s.workout_exercise_id=e.id
   WHERE w.user_id=$1 AND w.status='COMPLETED' AND s.completed_at IS NOT NULL AND ($2::uuid IS NULL OR e.exercise_id=$2::uuid)
   GROUP BY w.date ORDER BY w.date DESC LIMIT 365) recent ORDER BY date`,
      [owner, exerciseId || null],
    );
  }
}
