export const migration = `
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS equipment text NOT NULL DEFAULT 'other';
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS description_en text NOT NULL DEFAULT '';
CREATE INDEX IF NOT EXISTS exercises_equipment ON exercises(equipment);
`;
