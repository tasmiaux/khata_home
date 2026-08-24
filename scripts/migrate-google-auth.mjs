import { readFileSync } from "node:fs";
import { Pool } from "pg";

const envFile = readFileSync(new URL("../.env.local", import.meta.url), "utf-8");
for (const line of envFile.split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] ??= match[2].trim();
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Google is the sole auth method — one server-side row per signed-in
// profile, keyed by Google's stable subject id. expenses.user_id /
// shares.user_id keep referencing this row's id as a plain string, same
// as they always have; no FK, no change to those tables.
const sql = `
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  google_sub TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS profiles_name_lower_idx ON profiles ((lower(name)));
`;

const client = await pool.connect();
try {
  await client.query(sql);
  console.log("profiles table ready");
} finally {
  client.release();
  await pool.end();
}
