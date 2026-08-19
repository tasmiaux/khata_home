import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

function generateShareId(): string {
  return randomBytes(6).toString("base64url");
}

export async function GET(request: NextRequest) {
  const userId = new URL(request.url).searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId query param is required" }, { status: 400 });
  }

  const { rows } = await pool.query(
    `SELECT id, budget FROM shares WHERE user_id = $1`,
    [userId]
  );
  return NextResponse.json({ share: rows[0] ?? null });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { userId, ownerName } = body;
  const budget =
    body.budget === null || body.budget === undefined || body.budget === ""
      ? null
      : Number(body.budget);

  if (!userId || typeof userId !== "string") {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }
  if (!ownerName || typeof ownerName !== "string") {
    return NextResponse.json({ error: "ownerName is required" }, { status: 400 });
  }
  if (budget !== null && (!Number.isFinite(budget) || budget < 0)) {
    return NextResponse.json({ error: "Budget must be a positive number" }, { status: 400 });
  }

  const { rows } = await pool.query(
    `INSERT INTO shares (id, user_id, owner_name, budget)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id) DO UPDATE SET owner_name = $3, budget = $4
     RETURNING id, budget`,
    [generateShareId(), userId, ownerName, budget]
  );

  return NextResponse.json({ share: rows[0] });
}
