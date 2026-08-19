import { readFileSync } from "node:fs";
import { Pool } from "pg";

const envFile = readFileSync(new URL("../.env.local", import.meta.url), "utf-8");
for (const line of envFile.split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] ??= match[2].trim();
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// One share link per user (stable across regeneration/budget updates).
// The shared page reads this row plus live expense totals — no snapshot,
// no auth needed to view.
const sql = `
CREATE TABLE IF NOT EXISTS shares (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  owner_name TEXT NOT NULL,
  budget NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
`;

const client = await pool.connect();
try {
  await client.query(sql);
  console.log("shares table ready");
} finally {
  client.release();
  await pool.end();
}
