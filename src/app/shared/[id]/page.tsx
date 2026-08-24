import { notFound } from "next/navigation";
import { pool } from "@/lib/db";
import { CATEGORY_ICON } from "@/lib/categoryVisuals";
import type { Category } from "@/lib/constants";
import { localDayRangeUtc, localWeekRangeUtc, localMonthRangeUtc, toISODate } from "@/lib/date";

type CategoryTotal = { category: string; total: number };
type Period = "today" | "weekly" | "monthly";

const PERIOD_LABEL: Record<Period, string> = {
  today: "Today's spending",
  weekly: "This week's spending",
  monthly: "This month's spending",
};

function rangeForPeriod(period: Period) {
  const today = toISODate(new Date());
  if (period === "today") return localDayRangeUtc(today);
  if (period === "weekly") return localWeekRangeUtc(today);
  return localMonthRangeUtc(today);
}

async function getShareData(id: string) {
  const { rows: shareRows } = await pool.query(
    `SELECT user_id, owner_name, period FROM shares WHERE id = $1`,
    [id]
  );
  const share = shareRows[0];
  if (!share) return null;

  const period = share.period as Period;
  const { from, to } = rangeForPeriod(period);

  const { rows } = await pool.query(
    `SELECT category, SUM(amount) AS total
     FROM expenses
     WHERE user_id = $1
       AND created_at >= $2 AND created_at < $3
     GROUP BY category
     ORDER BY total DESC`,
    [share.user_id, from, to]
  );

  const byCategory: CategoryTotal[] = rows.map((r) => ({
    category: r.category,
    total: Number(r.total),
  }));
  const total = byCategory.reduce((sum, c) => sum + c.total, 0);

  return { ownerName: share.owner_name as string, period, total, byCategory };
}

export default async function SharedSummaryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getShareData(id);
  if (!data) notFound();

  const { ownerName, period, total, byCategory } = data;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8 px-5 py-8">
      <p className="label-stamp text-xs text-muted uppercase">
        Shared by {ownerName} via Khata
      </p>

      <header className="flex flex-col gap-1">
        <h1 className="font-serif text-3xl text-foreground">{PERIOD_LABEL[period]}</h1>
        <p className="text-[15px] text-muted">
          <span className="font-serif font-semibold text-accent">₹{total.toFixed(2)}</span>{" "}
          spent so far.
        </p>
      </header>

      <div className="flex flex-col">
        <h2 className="label-stamp mb-1 text-xs text-muted uppercase">
          Category breakdown
        </h2>
        {byCategory.length === 0 ? (
          <p className="py-3 text-sm text-muted/70">No expenses yet.</p>
        ) : (
          <ul className="flex flex-col">
            {byCategory.map((c) => {
              const Icon = CATEGORY_ICON[c.category as Category];
              return (
                <li
                  key={c.category}
                  className="flex min-h-12 items-center gap-3 border-t border-border py-3 last:border-b"
                >
                  {Icon && <Icon className="h-3.5 w-3.5 shrink-0 text-accent" strokeWidth={2} />}
                  <span className="flex-1 font-serif text-foreground">{c.category}</span>
                  <span className="font-serif tabular-nums text-foreground">
                    ₹{c.total.toFixed(2)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
