import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

const PERIODS = ["today", "weekly", "monthly"] as const;
type Period = (typeof PERIODS)[number];

function generateShareId(): string {
  return randomBytes(6).toString("base64url");
}

export async function GET(request: NextRequest) {
  const userId = new URL(request.url).searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId query param is required" }, { status: 400 });
  }

  const { rows } = await pool.query(
    `SELECT id, period FROM shares WHERE user_id = $1`,
    [userId]
  );
  return NextResponse.json({ share: rows[0] ?? null });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { userId, ownerName, period } = body;

  if (!userId || typeof userId !== "string") {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }
  if (!ownerName || typeof ownerName !== "string") {
    return NextResponse.json({ error: "ownerName is required" }, { status: 400 });
  }
  if (!PERIODS.includes(period)) {
    return NextResponse.json({ error: "period must be one of today, weekly, monthly" }, { status: 400 });
  }

  const { rows } = await pool.query(
    `INSERT INTO shares (id, user_id, owner_name, period)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id) DO UPDATE SET owner_name = $3, period = $4
     RETURNING id, period`,
    [generateShareId(), userId, ownerName, period as Period]
  );

  return NextResponse.json({ share: rows[0] });
}
