// Keep version 2 and its SQL behavior compatible with previously migrated databases.
export const migration = `
CREATE TABLE IF NOT EXISTS plans (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id),
  created_by uuid NOT NULL REFERENCES users(id),
  name text NOT NULL,
  focus text NOT NULL CHECK (
    focus IN ('shoulders', 'chest', 'abs', 'thighs', 'glutes', 'upper-body', 'lower-body', 'custom')
  ),
  scheduled_date date NOT NULL,
  weekdays integer[] NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS plans_user_date ON plans(user_id, scheduled_date);

CREATE TABLE IF NOT EXISTS plan_exercises (
  id uuid PRIMARY KEY,
  plan_id uuid NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  exercise_id uuid NOT NULL REFERENCES exercises(id),
  position integer NOT NULL,
  target_sets integer NOT NULL CHECK (target_sets BETWEEN 1 AND 30),
  target_reps integer NOT NULL CHECK (target_reps BETWEEN 1 AND 1000),
  target_weight numeric(8,2) NOT NULL CHECK (target_weight >= 0),
  target_rir integer NOT NULL CHECK (target_rir BETWEEN 0 AND 10),
  rest_seconds integer NOT NULL CHECK (
    rest_seconds BETWEEN 0 AND 3600 AND rest_seconds % 30 = 0
  ),
  rest_seconds_by_set integer[] NOT NULL DEFAULT '{}',
  UNIQUE (plan_id, position),
  UNIQUE (plan_id, exercise_id)
);

ALTER TABLE workouts ADD COLUMN IF NOT EXISTS plan_id uuid REFERENCES plans(id) ON DELETE SET NULL;
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'COMPLETED' CHECK(status IN ('IN_PROGRESS','COMPLETED'));
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS focus text;
CREATE UNIQUE INDEX IF NOT EXISTS workouts_plan_date ON workouts(plan_id,date) WHERE plan_id IS NOT NULL;

ALTER TABLE workout_sets ALTER COLUMN reps DROP NOT NULL;
ALTER TABLE workout_sets DROP CONSTRAINT IF EXISTS workout_sets_reps_check;
ALTER TABLE workout_sets ADD CONSTRAINT workout_sets_reps_check CHECK(reps BETWEEN 0 AND 1000);
ALTER TABLE workout_sets ADD COLUMN IF NOT EXISTS target_reps integer;
ALTER TABLE workout_sets ADD COLUMN IF NOT EXISTS target_rir integer NOT NULL DEFAULT 2 CHECK(target_rir BETWEEN 0 AND 10);
ALTER TABLE workout_sets ADD COLUMN IF NOT EXISTS rir integer CHECK(rir BETWEEN 0 AND 10);
ALTER TABLE workout_sets ADD COLUMN IF NOT EXISTS rest_seconds integer NOT NULL DEFAULT 90 CHECK(rest_seconds BETWEEN 0 AND 3600 AND rest_seconds % 30 = 0);
ALTER TABLE workout_sets ADD COLUMN IF NOT EXISTS completed_at timestamptz;

UPDATE workout_sets SET target_reps=reps,completed_at=now() WHERE target_reps IS NULL;
ALTER TABLE workout_sets ALTER COLUMN target_reps SET NOT NULL;
ALTER TABLE workout_sets ALTER COLUMN target_reps SET DEFAULT 12;
ALTER TABLE workout_sets ADD COLUMN IF NOT EXISTS failed boolean GENERATED ALWAYS AS (reps < target_reps) STORED;
`;
