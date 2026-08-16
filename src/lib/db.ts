import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var _khataPool: Pool | undefined;
}

export const pool =
  global._khataPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== "production") {
  global._khataPool = pool;
}
