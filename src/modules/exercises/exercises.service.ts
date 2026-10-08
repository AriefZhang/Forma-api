import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../database/database.service";
import { focusGroups } from "./focus-groups";

@Injectable()
export class ExercisesService {
  constructor(private db: DatabaseService) {}
  async exercises() {
    return this.db.query(
      `SELECT e.*,
       (SELECT json_build_object('id',machine.id,'name',machine.name,'nameEn',machine.name_en,
         'imageUrl',machine.image_url,'imageSvg',machine.image_svg,'instructions',machine.instructions,'instructionsEn',machine.instructions_en)
        FROM machines machine WHERE machine.id=e.machine_id) machine,
       coalesce(json_agg(json_build_object('id',m.id,'name',m.name,'imageUrl',m.image_url,'role',em.role)) FILTER(WHERE m.id IS NOT NULL),'[]') muscles
       FROM exercises e LEFT JOIN exercise_muscles em ON em.exercise_id=e.id
       LEFT JOIN muscles m ON m.id=em.muscle_id GROUP BY e.id ORDER BY e.name`,
    );
  }
  focuses() {
    return Object.entries(focusGroups).map(([id, muscleIds]) => ({
      id,
      muscleIds,
    }));
  }
}
