import { readFileSync } from "node:fs";
import { Pool } from "pg";

const envFile = readFileSync(new URL("../.env.local", import.meta.url), "utf-8");
for (const line of envFile.split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] ??= match[2].trim();
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Recurring expenses are just regular expense rows flagged is_recurring.
// The "template" for a monthly suggestion is derived from the most recent
// recurring row per (category, note) pair — no separate templates table.
const sql = `
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN NOT NULL DEFAULT false;
`;

const client = await pool.connect();
try {
  await client.query(sql);
  console.log("migrated: is_recurring column added to expenses");
} finally {
  client.release();
  await pool.end();
}
