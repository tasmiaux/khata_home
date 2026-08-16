import { readFileSync } from "node:fs";
import { Pool } from "pg";

const envFile = readFileSync(new URL("../.env.local", import.meta.url), "utf-8");
for (const line of envFile.split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] ??= match[2].trim();
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const sql = `
CREATE TABLE IF NOT EXISTS expenses (
  id SERIAL PRIMARY KEY,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  category TEXT NOT NULL,
  payment_mode TEXT NOT NULL CHECK (payment_mode IN ('Cash', 'UPI', 'Card')),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS expenses_created_at_idx ON expenses (created_at);
`;

const client = await pool.connect();
try {
  await client.query(sql);
  console.log("expenses table ready");
} finally {
  client.release();
  await pool.end();
}
