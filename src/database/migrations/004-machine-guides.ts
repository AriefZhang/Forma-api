export const migration = `
CREATE TABLE IF NOT EXISTS machines (
  id text PRIMARY KEY,
  name text NOT NULL,
  name_en text NOT NULL,
  image_url text,
  image_svg text NOT NULL DEFAULT '',
  instructions jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(instructions) = 'array'),
  instructions_en jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(instructions_en) = 'array'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS machine_id text REFERENCES machines(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS exercises_machine_id ON exercises(machine_id);
`;
