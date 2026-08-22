"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Share2, Copy, Check } from "lucide-react";
import { CATEGORY_ICON, CATEGORY_CHART_COLOR } from "@/lib/categoryVisuals";
import type { Category } from "@/lib/constants";
import { formatShortDate } from "@/lib/date";
import { useSelectedDate } from "@/lib/selectedDateContext";
import { useAuth } from "@/lib/authContext";

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
  Househelp: 800,
  Hangout: 1500,
  "Food Delivery": 900,
  Rides: 400,
  Shopping: 650,
  Medicines: 300,
  "Home Essentials": 500,
  Miscellaneous: 200,
};

const MOCK_MONTHLY: Partial<Record<Category, number>> = {
  "Groceries & Meat": 8200,
  Milk: 1400,
  "Electricity Bill": 3200,
  Househelp: 3200,
  Hangout: 4500,
  "Food Delivery": 2600,
  Rides: 1600,
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
  const { profile, isAuthenticated, ready } = useAuth();
  const { selectedDate, todayIso } = useSelectedDate();
  const isSelectedToday = selectedDate === todayIso;

  const [activeTab, setActiveTab] = useState<Tab>("today");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const [shareOpen, setShareOpen] = useState(false);
  const [shareId, setShareId] = useState<string | null>(null);
  const [shareBudget, setShareBudget] = useState("");
  const [shareLoading, setShareLoading] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setLoading(true);
    fetch(`/api/expenses?date=${selectedDate}&userId=${profile.id}`)
      .then((res) => res.json())
      .then((data) => {
        setExpenses(data.expenses ?? []);
        setLoading(false);
      });
  }, [selectedDate, profile]);

  useEffect(() => {
    if (!profile) return;
    fetch(`/api/shares?userId=${profile.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.share) {
          setShareId(data.share.id);
          setShareBudget(data.share.budget !== null ? String(data.share.budget) : "");
        }
      });
  }, [profile]);

  const shareLink = shareId && typeof window !== "undefined" ? `${window.location.origin}/shared/${shareId}` : null;

  async function handleGenerateShare() {
    if (!profile) return;
    setShareLoading(true);
    setShareError(null);
    try {
      const res = await fetch("/api/shares", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: profile.id,
          ownerName: profile.name,
          budget: shareBudget.trim() === "" ? null : Number(shareBudget),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to generate link");
      }
      const data = await res.json();
      setShareId(data.share.id);
    } catch (err) {
      setShareError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setShareLoading(false);
    }
  }

  async function handleCopy() {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setShareError("Couldn't copy automatically — select and copy the link above.");
    }
  }

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
      ? isSelectedToday
        ? "Today's breakdown"
        : `${formatShortDate(selectedDate)} breakdown`
      : activeTab === "weekly"
        ? "Weekly breakdown"
        : "Monthly breakdown";

  const summary =
    activeTab === "today"
      ? isSelectedToday
        ? `Today, ${formatShortDate(selectedDate)} — you've spent ₹${total.toFixed(2)}`
        : `${formatShortDate(selectedDate)} — you've spent ₹${total.toFixed(2)}`
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

  if (!ready || !isAuthenticated || !profile) return null;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8 px-5 py-8">
      <Link
        href="/"
        className="flex w-fit items-center gap-1.5 text-xs font-medium tracking-wide text-muted uppercase transition-colors hover:text-accent"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
        Back to Home
      </Link>

      <div className="flex flex-col gap-3 border border-border px-5 py-4">
        <button
          type="button"
          onClick={() => setShareOpen((o) => !o)}
          className="flex items-center gap-2 text-sm font-medium text-foreground"
        >
          <Share2 className="h-4 w-4 text-accent" strokeWidth={2} />
          Share with Family
        </button>

        {shareOpen && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="shareBudget"
                className="label-stamp text-xs text-muted uppercase"
              >
                Monthly Budget <span className="normal-case text-muted/60">(optional)</span>
              </label>
              <input
                id="shareBudget"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                placeholder="₹0.00"
                value={shareBudget}
                onChange={(e) => setShareBudget(e.target.value)}
                className="border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted/50 focus:border-accent focus:outline-none"
              />
            </div>

            {shareError && <p className="text-sm text-red-700">{shareError}</p>}

            <button
              type="button"
              onClick={handleGenerateShare}
              disabled={shareLoading}
              className="bg-accent px-4 py-2.5 text-sm font-medium text-background transition-colors hover:bg-accent/90 disabled:opacity-50"
            >
              {shareLoading ? "Saving..." : shareLink ? "Update Link" : "Generate Link"}
            </button>

            {shareLink && (
              <div className="flex flex-col gap-2">
                <div className="border border-border px-3 py-2 text-sm text-muted">
                  {shareLink}
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center justify-center gap-1.5 border border-border px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent-soft"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5" strokeWidth={2} />
                  ) : (
                    <Copy className="h-3.5 w-3.5" strokeWidth={2} />
                  )}
                  {copied ? "Copied" : "Copy Link"}
                </button>
                <p className="text-xs text-muted">
                  Anyone with this link can view a read-only summary — no login needed.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

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
              <span className="label-stamp text-xs text-muted uppercase">Total</span>
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
                  className="flex min-h-12 items-center gap-3 border-t border-border py-3 last:border-b"
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
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
