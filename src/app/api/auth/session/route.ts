import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSessionProfileId } from "@/lib/session";

export async function GET() {
  const profileId = await getSessionProfileId();
  if (!profileId) {
    return NextResponse.json({ profile: null }, { headers: { "Cache-Control": "no-store" } });
  }

  const { rows } = await pool.query(
    `SELECT id, name, email FROM profiles WHERE id = $1`,
    [profileId]
  );
  return NextResponse.json(
    { profile: rows[0] ?? null },
    { headers: { "Cache-Control": "no-store" } }
  );
}
