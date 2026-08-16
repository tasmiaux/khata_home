import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { CATEGORIES, PAYMENT_MODES } from "@/lib/constants";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
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
    `UPDATE expenses
     SET amount = $1, category = $2, payment_mode = $3, note = $4
     WHERE id = $5
     RETURNING id, amount, category, payment_mode, note, created_at`,
    [amount, category, paymentMode, note || null, id]
  );

  if (rows.length === 0) {
    return NextResponse.json({ error: "Expense not found" }, { status: 404 });
  }
  return NextResponse.json({ expense: rows[0] });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const { rowCount } = await pool.query(`DELETE FROM expenses WHERE id = $1`, [id]);

  if (rowCount === 0) {
    return NextResponse.json({ error: "Expense not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
