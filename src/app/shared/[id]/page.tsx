import { notFound } from "next/navigation";
import { pool } from "@/lib/db";
import { CATEGORY_ICON } from "@/lib/categoryVisuals";
import type { Category } from "@/lib/constants";

type CategoryTotal = { category: string; total: number };

async function getShareData(id: string) {
  const { rows: shareRows } = await pool.query(
    `SELECT user_id, owner_name, budget FROM shares WHERE id = $1`,
    [id]
  );
  const share = shareRows[0];
  if (!share) return null;

  const { rows } = await pool.query(
    `SELECT category, SUM(amount) AS total
     FROM expenses
     WHERE (user_id = $1 OR user_id IS NULL)
       AND created_at >= date_trunc('month', now())
     GROUP BY category
     ORDER BY total DESC`,
    [share.user_id]
  );

  const byCategory: CategoryTotal[] = rows.map((r) => ({
    category: r.category,
    total: Number(r.total),
  }));
  const monthTotal = byCategory.reduce((sum, c) => sum + c.total, 0);
  const budget = share.budget === null ? null : Number(share.budget);

  return { ownerName: share.owner_name as string, budget, monthTotal, byCategory };
}

export default async function SharedSummaryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getShareData(id);
  if (!data) notFound();

  const { ownerName, budget, monthTotal, byCategory } = data;
  const remaining = budget !== null ? budget - monthTotal : null;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8 px-5 py-8">
      <p className="text-xs font-medium tracking-wide text-muted uppercase">
        Shared by {ownerName} via Khata
      </p>

      <header className="flex flex-col gap-1">
        <h1 className="font-serif text-3xl text-foreground">This month&apos;s spending</h1>
        <p className="text-[15px] text-muted">
          <span className="font-serif font-semibold text-accent">₹{monthTotal.toFixed(2)}</span>{" "}
          spent so far.
        </p>
      </header>

      {remaining !== null && (
        <div className="flex items-baseline justify-between border border-border px-5 py-4">
          <span className="text-xs font-medium tracking-wide text-muted uppercase">
            Remaining Budget
          </span>
          <span
            className={`font-serif text-lg font-semibold tabular-nums ${
              remaining < 0 ? "text-red-700" : "text-accent"
            }`}
          >
            ₹{remaining.toFixed(2)}
          </span>
        </div>
      )}

      <div className="flex flex-col">
        <h2 className="mb-1 text-xs font-medium tracking-wide text-muted uppercase">
          Category breakdown
        </h2>
        {byCategory.length === 0 ? (
          <p className="py-3 text-sm text-muted/70">No expenses yet this month.</p>
        ) : (
          <ul className="flex flex-col">
            {byCategory.map((c) => {
              const Icon = CATEGORY_ICON[c.category as Category];
              return (
                <li
                  key={c.category}
                  className="flex items-center gap-3 border-t border-border py-3 last:border-b"
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
