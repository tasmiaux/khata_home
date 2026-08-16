import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { CATEGORIES, PAYMENT_MODES } from "@/lib/constants";

export async function GET(request: NextRequest) {
  const date = new URL(request.url).searchParams.get("date");
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "date query param (YYYY-MM-DD) is required" }, { status: 400 });
  }

  const { rows } = await pool.query(
    `SELECT id, amount, category, payment_mode, note, created_at
     FROM expenses
     WHERE created_at::date = $1::date
     ORDER BY created_at DESC`,
    [date]
  );
  return NextResponse.json({ expenses: rows });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const amount = Number(body.amount);
  const { category, paymentMode } = body;
  const note = typeof body.note === "string" ? body.note.trim() : "";

  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Amount must be a positive number" }, { status: 400 });
  }
  if (!(CATEGORIES as readonly string[]).includes(category)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }
  if (!(PAYMENT_MODES as readonly string[]).includes(paymentMode)) {
    return NextResponse.json({ error: "Invalid payment mode" }, { status: 400 });
  }

  const { rows } = await pool.query(
    `INSERT INTO expenses (amount, category, payment_mode, note)
     VALUES ($1, $2, $3, $4)
     RETURNING id, amount, category, payment_mode, note, created_at`,
    [amount, category, paymentMode, note || null]
  );

  return NextResponse.json({ expense: rows[0] }, { status: 201 });
}
