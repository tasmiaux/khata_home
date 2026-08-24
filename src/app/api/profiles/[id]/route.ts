import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

type RouteContext = { params: Promise<{ id: string }> };

// Wipes all server-side data for a profile id — expenses and any share
// link. Used by the client-side duplicate-profile cleanup (auth.ts's
// dedupeProfiles) to remove a merged-away duplicate's history. Trust model
// matches the rest of this local-only-auth app: any client that knows a
// profile id can call this, same as the other user_id-scoped routes.
export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  await pool.query(`DELETE FROM expenses WHERE user_id = $1`, [id]);
  await pool.query(`DELETE FROM shares WHERE user_id = $1`, [id]);
  return NextResponse.json({ success: true });
}
