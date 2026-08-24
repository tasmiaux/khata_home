import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

// Compares the current month's top-spending category against what was
// spent in that same category last month. Returns null (no comparison
// shown) when there's no current-month spend yet, or no prior data for
// that category to compare against.
export async function GET(request: NextRequest) {
  const params = new URL(request.url).searchParams;
  const userId = params.get("userId");
  const currentFrom = params.get("currentFrom");
  const currentTo = params.get("currentTo");
  const previousFrom = params.get("previousFrom");
  const previousTo = params.get("previousTo");

  if (!userId || !currentFrom || !currentTo || !previousFrom || !previousTo) {
    return NextResponse.json(
      { error: "userId, currentFrom, currentTo, previousFrom, previousTo are required" },
      { status: 400 }
    );
  }

  const { rows: currentRows } = await pool.query(
    `SELECT category, SUM(amount) AS total
     FROM expenses
     WHERE created_at >= $1 AND created_at < $2 AND user_id = $3
     GROUP BY category
     ORDER BY total DESC
     LIMIT 1`,
    [currentFrom, currentTo, userId]
  );

  if (currentRows.length === 0) {
    return NextResponse.json({ comparison: null });
  }

  const topCategory = currentRows[0].category;
  const currentTotal = Number(currentRows[0].total);

  const { rows: previousRows } = await pool.query(
    `SELECT COALESCE(SUM(amount), 0) AS total
     FROM expenses
     WHERE category = $1 AND created_at >= $2 AND created_at < $3
       AND user_id = $4`,
    [topCategory, previousFrom, previousTo, userId]
  );

  const previousTotal = Number(previousRows[0].total);
  if (previousTotal === 0) {
    return NextResponse.json({ comparison: null });
  }

  return NextResponse.json({
    comparison: {
      category: topCategory,
      currentTotal,
      previousTotal,
      delta: currentTotal - previousTotal,
    },
  });
}
