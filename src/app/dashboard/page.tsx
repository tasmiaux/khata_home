"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CATEGORY_ICON, CATEGORY_CHART_COLOR } from "@/lib/categoryVisuals";
import type { Category } from "@/lib/constants";
import { toISODate, formatShortDate } from "@/lib/date";
import SavingsNudgeCard from "@/components/SavingsNudgeCard";

type Expense = {
  id: number;
  amount: string;
  category: string;
  payment_mode: string;
  note: string | null;
  created_at: string;
};

type CategoryTotal = { category: string; total: number };
type Tab = "today" | "weekly" | "monthly";

const TABS: { value: Tab; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

// Placeholder numbers for the Weekly/Monthly tabs so the UI is demoable
// without full date-range aggregation. TODO: replace with a real
// /api/expenses/summary?range=week|month query once that's built.
const MOCK_WEEKLY: Partial<Record<Category, number>> = {
  "Groceries & Meat": 2100,
  Milk: 350,
  "Electricity Bill": 1200,
  Maid: 800,
  Hangout: 1500,
  "Food Delivery": 900,
  Shopping: 650,
  Medicines: 300,
  "Home Essentials": 500,
  Miscellaneous: 200,
};

const MOCK_MONTHLY: Partial<Record<Category, number>> = {
  "Groceries & Meat": 8200,
  Milk: 1400,
  "Electricity Bill": 3200,
  Maid: 3200,
  Hangout: 4500,
  "Food Delivery": 2600,
  Shopping: 2100,
  Medicines: 950,
  Repairs: 1200,
  "Home Essentials": 1800,
  Miscellaneous: 600,
};

const SIZE = 200;
const STROKE = 26;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const FALLBACK_COLOR = "#98918a";

export default function Dashboard() {
  const [todayIso] = useState(() => toISODate(new Date()));
  const [activeTab, setActiveTab] = useState<Tab>("today");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/expenses?date=${todayIso}`)
      .then((res) => res.json())
      .then((data) => {
        setExpenses(data.expenses ?? []);
        setLoading(false);
      });
  }, [todayIso]);

  const byCategory: CategoryTotal[] =
    activeTab === "today"
      ? Object.values(
          expenses.reduce<Record<string, CategoryTotal>>((acc, e) => {
            acc[e.category] ??= { category: e.category, total: 0 };
            acc[e.category].total += Number(e.amount);
            return acc;
          }, {})
        ).sort((a, b) => b.total - a.total)
      : Object.entries(activeTab === "weekly" ? MOCK_WEEKLY : MOCK_MONTHLY)
          .map(([category, total]) => ({ category, total: total ?? 0 }))
          .sort((a, b) => b.total - a.total);

  const total = byCategory.reduce((sum, c) => sum + c.total, 0);
  const isLoading = activeTab === "today" && loading;

  const heading =
    activeTab === "today"
      ? "Today's breakdown"
      : activeTab === "weekly"
        ? "Weekly breakdown"
        : "Monthly breakdown";

  const summary =
    activeTab === "today"
      ? `Today, ${formatShortDate(todayIso)} — you've spent ₹${total.toFixed(2)}`
      : activeTab === "weekly"
        ? `This week — you've spent ₹${total.toFixed(2)}`
        : `This month — you've spent ₹${total.toFixed(2)}`;

  let cumulative = 0;
  const segments = byCategory.map((c) => {
    const fraction = total > 0 ? c.total / total : 0;
    const dash = fraction * CIRCUMFERENCE;
    const segment = {
      ...c,
      color: CATEGORY_CHART_COLOR[c.category as Category] ?? FALLBACK_COLOR,
      dashArray: `${dash} ${CIRCUMFERENCE - dash}`,
      dashOffset: -cumulative,
      percent: Math.round(fraction * 100),
    };
    cumulative += dash;
    return segment;
  });

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8 px-5 py-8">
      <Link
        href="/"
        className="flex w-fit items-center gap-1.5 text-xs font-medium tracking-wide text-muted uppercase transition-colors hover:text-accent"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
        Back to Home
      </Link>

      <SavingsNudgeCard />

      <div className="mx-auto flex w-full max-w-md items-center justify-center gap-1 rounded-full border border-border p-1.5">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveTab(tab.value)}
            className={`flex-1 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === tab.value ? "bg-accent text-background" : "text-muted hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <header className="flex flex-col gap-1">
        <h1 className="font-serif text-3xl text-foreground">{heading}</h1>
        <p className="text-[15px] text-muted">{summary}</p>
      </header>

      {isLoading ? (
        <p className="py-3 text-sm text-muted/70">Loading...</p>
      ) : byCategory.length === 0 ? (
        <p className="py-3 text-sm text-muted/70">No expenses yet.</p>
      ) : (
        <>
          <div className="relative mx-auto flex items-center justify-center">
            <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="-rotate-90">
              <circle
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke="var(--color-border)"
                strokeWidth={STROKE}
              />
              {segments.map((s) => (
                <circle
                  key={s.category}
                  cx={SIZE / 2}
                  cy={SIZE / 2}
                  r={RADIUS}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={STROKE}
                  strokeDasharray={s.dashArray}
                  strokeDashoffset={s.dashOffset}
                />
              ))}
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-xs font-medium tracking-wide text-muted uppercase">Total</span>
              <span className="font-serif text-2xl font-semibold text-foreground">
                ₹{total.toFixed(2)}
              </span>
            </div>
          </div>

          <ul className="flex flex-col">
            {segments.map((s) => {
              const Icon = CATEGORY_ICON[s.category as Category];
              return (
                <li
                  key={s.category}
                  className="flex items-center gap-3 border-t border-border py-3 last:border-b"
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-sm"
                    style={{ backgroundColor: s.color }}
                  />
                  {Icon && <Icon className="h-3.5 w-3.5 shrink-0 text-accent" strokeWidth={2} />}
                  <span className="flex-1 font-serif text-foreground">{s.category}</span>
                  <span className="text-xs text-muted">{s.percent}%</span>
                  <span className="w-20 text-right font-serif tabular-nums text-foreground">
                    ₹{s.total.toFixed(2)}
                  </span>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </main>
  );
}
