import { readFileSync } from "node:fs";
import { Pool } from "pg";

const envFile = readFileSync(new URL("../.env.local", import.meta.url), "utf-8");
for (const line of envFile.split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] ??= match[2].trim();
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Share links are now built around a period (Today/Weekly/Monthly) instead
// of a budget — the shared page shows spent + category breakdown only.
const sql = `
ALTER TABLE shares ADD COLUMN IF NOT EXISTS period TEXT NOT NULL DEFAULT 'monthly'
  CHECK (period IN ('today', 'weekly', 'monthly'));
ALTER TABLE shares DROP COLUMN IF EXISTS budget;
`;

const client = await pool.connect();
try {
  await client.query(sql);
  console.log("migrated: shares now have a period column, budget column dropped");
} finally {
  client.release();
  await pool.end();
}
