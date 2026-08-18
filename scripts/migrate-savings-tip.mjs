import { readFileSync } from "node:fs";
import { Pool } from "pg";

const envFile = readFileSync(new URL("../.env.local", import.meta.url), "utf-8");
for (const line of envFile.split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] ??= match[2].trim();
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Single-row cache so the Smart Savings Nudge only calls the Claude API
// once per day instead of on every Dashboard load.
const sql = `
CREATE TABLE IF NOT EXISTS savings_tip_cache (
  id SMALLINT PRIMARY KEY DEFAULT 1,
  tip TEXT NOT NULL,
  generated_on DATE NOT NULL,
  CONSTRAINT savings_tip_cache_single_row CHECK (id = 1)
);
`;

const client = await pool.connect();
try {
  await client.query(sql);
  console.log("savings_tip_cache table ready");
} finally {
  client.release();
  await pool.end();
}
