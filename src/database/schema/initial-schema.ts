// Original schema, retained as the baseline for fresh and existing databases.
// Subsequent changes belong in versioned migrations, rather than this baseline.
export const schema = `
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL CHECK (role IN ('TRAINER', 'CLIENT')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS trainer_clients (
  trainer_id uuid REFERENCES users(id),
  client_id uuid REFERENCES users(id),
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACTIVE')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (trainer_id, client_id),
  CHECK (trainer_id <> client_id)
);
CREATE INDEX IF NOT EXISTS trainer_clients_client ON trainer_clients(client_id);

CREATE TABLE IF NOT EXISTS muscles (
  id text PRIMARY KEY,
  name text NOT NULL,
  image_url text NOT NULL
);

CREATE TABLE IF NOT EXISTS exercises (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS exercise_muscles (
  exercise_id uuid REFERENCES exercises(id) ON DELETE CASCADE,
  muscle_id text REFERENCES muscles(id),
  role text CHECK (role IN ('PRIMARY', 'SECONDARY')),
  PRIMARY KEY (exercise_id, muscle_id)
);

CREATE TABLE IF NOT EXISTS workouts (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id),
  created_by uuid NOT NULL REFERENCES users(id),
  date date NOT NULL,
  name text NOT NULL,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS workouts_user_date ON workouts(user_id, date DESC);

CREATE TABLE IF NOT EXISTS workout_exercises (
  id uuid PRIMARY KEY,
  workout_id uuid REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id uuid REFERENCES exercises(id),
  position integer NOT NULL,
  UNIQUE (workout_id, position)
);

CREATE TABLE IF NOT EXISTS workout_sets (
  id uuid PRIMARY KEY,
  workout_exercise_id uuid REFERENCES workout_exercises(id) ON DELETE CASCADE,
  set_number integer NOT NULL CHECK (set_number > 0),
  reps integer NOT NULL CHECK (reps > 0),
  weight numeric(8,2) NOT NULL CHECK (weight >= 0),
  UNIQUE (workout_exercise_id, set_number)
);
CREATE INDEX IF NOT EXISTS workout_exercises_exercise ON workout_exercises(exercise_id);
`;
