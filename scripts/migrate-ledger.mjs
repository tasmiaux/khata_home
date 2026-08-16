import { readFileSync } from "node:fs";
import { Pool } from "pg";

const envFile = readFileSync(new URL("../.env.local", import.meta.url), "utf-8");
for (const line of envFile.split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] ??= match[2].trim();
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const sql = `
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS note TEXT;

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'expenses'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%category%'
  LOOP
    EXECUTE format('ALTER TABLE expenses DROP CONSTRAINT %I', r.conname);
  END LOOP;
END $$;
`;

const client = await pool.connect();
try {
  await client.query(sql);
  console.log("migrated: note column added, category constraint relaxed");
} finally {
  client.release();
  await pool.end();
}
