import { readFileSync } from "node:fs";
import { Pool } from "pg";

const envFile = readFileSync(new URL("../.env.local", import.meta.url), "utf-8");
for (const line of envFile.split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] ??= match[2].trim();
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Tags each expense with the locally-generated profile id from the new
// mock auth flow, so data stays separated per registered profile.
// Rows with user_id NULL predate auth and are treated as shared/legacy —
// visible to any signed-in profile until claimed by new writes.
const sql = `
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS user_id TEXT;
CREATE INDEX IF NOT EXISTS expenses_user_id_idx ON expenses (user_id);
`;

const client = await pool.connect();
try {
  await client.query(sql);
  console.log("migrated: user_id column added to expenses");
} finally {
  client.release();
  await pool.end();
}
