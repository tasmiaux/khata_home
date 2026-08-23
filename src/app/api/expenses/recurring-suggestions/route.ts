import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

// Finds each distinct recurring template (latest values per category+note)
// that hasn't already been logged (recurring or not) in the given month —
// so a suggestion disappears once the user acts on it or adds it manually.
export async function GET(request: NextRequest) {
  const params = new URL(request.url).searchParams;
  const userId = params.get("userId");
  const monthFrom = params.get("monthFrom");
  const monthTo = params.get("monthTo");

  if (!userId) {
    return NextResponse.json({ error: "userId query param is required" }, { status: 400 });
  }
  if (!monthFrom || !monthTo) {
    return NextResponse.json(
      { error: "monthFrom and monthTo query params (ISO timestamps) are required" },
      { status: 400 }
    );
  }

  const { rows } = await pool.query(
    `WITH latest_recurring AS (
       SELECT DISTINCT ON (category, COALESCE(note, ''))
         category, amount, payment_mode, note
       FROM expenses
       WHERE (user_id = $1 OR user_id IS NULL) AND is_recurring = true
       ORDER BY category, COALESCE(note, ''), created_at DESC
     ),
     logged_this_month AS (
       SELECT DISTINCT category, COALESCE(note, '') AS note_key
       FROM expenses
       WHERE (user_id = $1 OR user_id IS NULL)
         AND created_at >= $2 AND created_at < $3
     )
     SELECT lr.category, lr.amount, lr.payment_mode, lr.note
     FROM latest_recurring lr
     LEFT JOIN logged_this_month lm
       ON lm.category = lr.category AND lm.note_key = COALESCE(lr.note, '')
     WHERE lm.category IS NULL`,
    [userId, monthFrom, monthTo]
  );

  return NextResponse.json({ suggestions: rows });
}
