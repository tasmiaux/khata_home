import { readFileSync } from "node:fs";
import { Pool } from "pg";

const envFile = readFileSync(new URL("../.env.local", import.meta.url), "utf-8");
for (const line of envFile.split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] ??= match[2].trim();
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Closes the cross-profile leak: rows with no owner (pre-auth data) were
// visible to every profile via `OR user_id IS NULL` in the API queries.
// Those rows are deleted here (not reassigned), then user_id is made
// mandatory so the leak can't reopen.
const sql = `
DELETE FROM expenses WHERE user_id IS NULL;
ALTER TABLE expenses ALTER COLUMN user_id SET NOT NULL;
`;

const client = await pool.connect();
try {
  await client.query(sql);
  console.log("migrated: unowned expenses deleted, user_id is now required");
} finally {
  client.release();
  await pool.end();
}
