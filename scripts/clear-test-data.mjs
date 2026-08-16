import { readFileSync } from "node:fs";
import { Pool } from "pg";

const envFile = readFileSync(new URL("../.env.local", import.meta.url), "utf-8");
for (const line of envFile.split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] ??= match[2].trim();
}

const VALID_CATEGORIES = [
  "Groceries & Meat",
  "Medicines",
  "Hangout",
  "Maid",
  "Milk",
  "Electricity Bill",
  "Repairs",
  "Food Delivery",
  "Shopping",
  "Home Essentials",
  "Miscellaneous",
];

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const client = await pool.connect();
try {
  // Legacy category names from before the category list changed, plus the
  // one 0.03 "Shopping" entry that was a leftover pre-redesign test (real
  // Shopping entries from the redesign test are left alone).
  const { rows } = await client.query(
    `DELETE FROM expenses
     WHERE category != ALL($1::text[])
        OR (category = 'Shopping' AND amount = 0.03)
     RETURNING id, amount, category, payment_mode, created_at`,
    [VALID_CATEGORIES]
  );
  console.log(`Deleted ${rows.length} row(s):`);
  for (const r of rows) {
    console.log(`  #${r.id}  ₹${r.amount}  ${r.category}  ${r.payment_mode}  ${r.created_at}`);
  }
} finally {
  client.release();
  await pool.end();
}
