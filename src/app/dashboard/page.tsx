"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Share2, Copy, Check } from "lucide-react";
import { CATEGORY_CHART_COLOR } from "@/lib/categoryVisuals";
import type { Category } from "@/lib/constants";
import CategoryChip from "@/components/CategoryChip";
import SegmentedControl from "@/components/SegmentedControl";
import {
  formatShortDate,
  localDayRangeUtc,
  localMonthRangeUtc,
  localPreviousMonthRangeUtc,
  localWeekRangeUtc,
} from "@/lib/date";
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
type MonthComparison = {
  category: string;
  currentTotal: number;
  previousTotal: number;
  delta: number;
};

const TABS: { value: Tab; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

const SIZE = 200;
const STROKE = 26;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const FALLBACK_COLOR = "#8a8070";

export default function Dashboard() {
  const { profile, isAuthenticated, ready } = useAuth();
  const { selectedDate, todayIso } = useSelectedDate();
  const isSelectedToday = selectedDate === todayIso;

  const [activeTab, setActiveTab] = useState<Tab>("today");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const [comparison, setComparison] = useState<MonthComparison | null>(null);

  const [shareOpen, setShareOpen] = useState(false);
  const [shareId, setShareId] = useState<string | null>(null);
  const [sharePeriod, setSharePeriod] = useState<Tab>("today");
  const [shareLoading, setShareLoading] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setLoading(true);
    const { from, to } =
      activeTab === "today"
        ? localDayRangeUtc(selectedDate)
        : activeTab === "weekly"
          ? localWeekRangeUtc(selectedDate)
          : localMonthRangeUtc(selectedDate);
    fetch(`/api/expenses?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&userId=${profile.id}`)
      .then((res) => res.json())
      .then((data) => {
        setExpenses(data.expenses ?? []);
        setLoading(false);
      });
  }, [selectedDate, profile, activeTab]);

  useEffect(() => {
    if (!profile) return;
    fetch(`/api/shares?userId=${profile.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.share) setShareId(data.share.id);
      });
  }, [profile]);

  useEffect(() => {
    if (!profile) return;
    const current = localMonthRangeUtc(todayIso);
    const previous = localPreviousMonthRangeUtc(todayIso);
    const url =
      `/api/expenses/month-comparison?userId=${profile.id}` +
      `&currentFrom=${encodeURIComponent(current.from)}&currentTo=${encodeURIComponent(current.to)}` +
      `&previousFrom=${encodeURIComponent(previous.from)}&previousTo=${encodeURIComponent(previous.to)}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => setComparison(data.comparison ?? null));
  }, [profile, todayIso]);

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
          period: sharePeriod,
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

  const byCategory: CategoryTotal[] = Object.values(
    expenses.reduce<Record<string, CategoryTotal>>((acc, e) => {
      acc[e.category] ??= { category: e.category, total: 0 };
      acc[e.category].total += Number(e.amount);
      return acc;
    }, {})
  ).sort((a, b) => b.total - a.total);

  const total = byCategory.reduce((sum, c) => sum + c.total, 0);

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
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-5 pt-3 pb-6">
      <Link
        href="/"
        className="flex w-fit items-center gap-1.5 text-xs font-medium tracking-wide text-muted uppercase transition-colors hover:text-accent"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
        Back to Home
      </Link>

      <div className="card flex flex-col gap-3 px-5 py-4">
        <button
          type="button"
          onClick={() =>
            setShareOpen((o) => {
              if (!o) setSharePeriod(activeTab);
              return !o;
            })
          }
          className="flex items-center gap-2 text-sm font-medium text-foreground"
        >
          <Share2 className="h-4 w-4 text-accent" strokeWidth={2} />
          Share with Family
        </button>

        {shareOpen && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <span className="label-stamp text-xs text-muted uppercase">Period</span>
              <SegmentedControl
                ariaLabel="Share period"
                options={TABS}
                value={sharePeriod}
                onChange={setSharePeriod}
              />
            </div>

            {shareError && <p className="text-sm text-red-700">{shareError}</p>}

            <button
              type="button"
              onClick={handleGenerateShare}
              disabled={shareLoading}
              className="rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-on-accent transition-colors hover:bg-accent/90 disabled:opacity-50"
            >
              {shareLoading ? "Saving..." : shareLink ? "Update Link" : "Generate Link"}
            </button>

            {shareLink && (
              <div className="flex flex-col gap-2">
                <div className="rounded-2xl bg-field border border-border/60 px-4 py-2.5 text-sm break-all text-muted">
                  {shareLink}
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center justify-center gap-1.5 rounded-full bg-accent-soft px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/20"
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

      <SegmentedControl
        ariaLabel="Time range"
        options={TABS}
        value={activeTab}
        onChange={setActiveTab}
        className="w-full"
      />

      <header className="flex flex-col gap-1">
        <h1 className="font-serif text-3xl text-foreground">{heading}</h1>
        <p className="text-[15px] text-muted">{summary}</p>
        {comparison && (
          <p className="text-[15px] text-muted">
            You&apos;ve spent{" "}
            <span className="font-serif font-semibold text-accent">
              ₹{Math.abs(comparison.delta).toFixed(2)}
            </span>{" "}
            {comparison.delta > 0 ? "more" : comparison.delta < 0 ? "less" : "the same"} on{" "}
            {comparison.category} {comparison.delta === 0 ? "as" : "than"} last month.
          </p>
        )}
      </header>

      {loading ? (
        <p className="py-3 text-sm text-muted/70">Loading...</p>
      ) : byCategory.length === 0 ? (
        <p className="py-3 text-sm text-muted/70">No expenses yet.</p>
      ) : (
        <>
          <div className="card relative flex items-center justify-center px-5 py-6">
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

          <ul className="flex flex-col gap-2">
            {segments.map((s) => (
              <li key={s.category} className="card flex min-h-16 items-center gap-3 px-4 py-3">
                <CategoryChip category={s.category} />
                <span className="flex-1 font-serif font-medium text-foreground">{s.category}</span>
                <div className="flex flex-col items-end">
                  <span className="font-serif font-semibold tabular-nums text-foreground">
                    ₹{s.total.toFixed(2)}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-muted">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: s.color }}
                    />
                    {s.percent}%
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
