import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { CATEGORIES, PAYMENT_MODES } from "@/lib/constants";

export async function GET(request: NextRequest) {
  const params = new URL(request.url).searchParams;
  const from = params.get("from");
  const to = params.get("to");
  const userId = params.get("userId");
  if (!from || !to || Number.isNaN(Date.parse(from)) || Number.isNaN(Date.parse(to))) {
    return NextResponse.json(
      { error: "from and to query params (ISO timestamps) are required" },
      { status: 400 }
    );
  }
  if (!userId) {
    return NextResponse.json({ error: "userId query param is required" }, { status: 400 });
  }

  const { rows } = await pool.query(
    `SELECT id, amount, category, payment_mode, note, created_at
     FROM expenses
     WHERE created_at >= $1 AND created_at < $2
       AND user_id = $3
     ORDER BY created_at DESC`,
    [from, to, userId]
  );
  return NextResponse.json({ expenses: rows });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const amount = Number(body.amount);
  const { category, paymentMode, userId } = body;
  const note = typeof body.note === "string" ? body.note.trim() : "";
  const isRecurring = body.isRecurring === true;
  const createdAt = typeof body.createdAt === "string" ? body.createdAt : null;

  if (!userId || typeof userId !== "string") {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Amount must be a positive number" }, { status: 400 });
  }
  if (!(CATEGORIES as readonly string[]).includes(category)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }
  if (!(PAYMENT_MODES as readonly string[]).includes(paymentMode)) {
    return NextResponse.json({ error: "Invalid payment mode" }, { status: 400 });
  }
  if (createdAt !== null && Number.isNaN(Date.parse(createdAt))) {
    return NextResponse.json({ error: "createdAt must be a valid timestamp" }, { status: 400 });
  }

  const { rows } = await pool.query(
    `INSERT INTO expenses (amount, category, payment_mode, note, user_id, is_recurring, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, now()))
     RETURNING id, amount, category, payment_mode, note, created_at`,
    [amount, category, paymentMode, note || null, userId, isRecurring, createdAt]
  );

  return NextResponse.json({ expense: rows[0] }, { status: 201 });
}
