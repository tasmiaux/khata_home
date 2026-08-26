"use client";

import { useEffect, useState, FormEvent } from "react";
import { CATEGORIES, PAYMENT_MODES, type Category, type PaymentMode } from "@/lib/constants";
import { CATEGORY_ICON, PAYMENT_ICON } from "@/lib/categoryVisuals";
import Select from "@/components/Select";
import Pill from "@/components/Pill";
import {
  formatChipDate,
  formatDateLabel,
  isoTimestampForLocalDate,
  localDayRangeUtc,
  localMonthRangeUtc,
  toISODate,
} from "@/lib/date";
import { useSelectedDate } from "@/lib/selectedDateContext";
import { useAuth } from "@/lib/authContext";
import { Calendar, ChevronDown, Pencil, Trash2, Check, Plus } from "lucide-react";

const CATEGORY_OPTIONS = CATEGORIES.map((c) => ({ value: c, label: c, icon: CATEGORY_ICON[c] }));
const PAYMENT_OPTIONS = PAYMENT_MODES.map((p) => ({ value: p, label: p, icon: PAYMENT_ICON[p] }));

type Expense = {
  id: number;
  amount: string;
  category: string;
  payment_mode: string;
  note: string | null;
  created_at: string;
};

type EditDraft = {
  id: number;
  amount: string;
  category: Category;
  paymentMode: PaymentMode;
  note: string;
  date: string;
  originalDate: string;
};

type RecurringSuggestion = {
  category: string;
  amount: string;
  payment_mode: string;
  note: string | null;
};

export default function Home() {
  const { profile, isAuthenticated, ready } = useAuth();
  const { selectedDate, setSelectedDate, todayIso } = useSelectedDate();
  const isToday = selectedDate === todayIso;

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Category | null>(null);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>(PAYMENT_MODES[0]);
  const [note, setNote] = useState("");
  const [repeatMonthly, setRepeatMonthly] = useState(false);

  const [editing, setEditing] = useState<EditDraft | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [pendingDelete, setPendingDelete] = useState<{
    expense: Expense;
    timer: ReturnType<typeof setTimeout>;
  } | null>(null);

  const [suggestions, setSuggestions] = useState<RecurringSuggestion[]>([]);
  const [addingSuggestion, setAddingSuggestion] = useState<number | null>(null);

  async function loadSuggestions() {
    if (!profile) return;
    const { from, to } = localMonthRangeUtc(todayIso);
    const res = await fetch(
      `/api/expenses/recurring-suggestions?userId=${profile.id}&monthFrom=${encodeURIComponent(from)}&monthTo=${encodeURIComponent(to)}`
    );
    const data = await res.json();
    setSuggestions(data.suggestions ?? []);
  }

  useEffect(() => {
    if (profile) loadSuggestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  async function handleAddSuggestion(suggestion: RecurringSuggestion, index: number) {
    if (!profile) return;
    setAddingSuggestion(index);
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(suggestion.amount),
          category: suggestion.category,
          paymentMode: suggestion.payment_mode,
          note: suggestion.note ?? "",
          userId: profile.id,
          isRecurring: true,
        }),
      });
      if (!res.ok) throw new Error("Failed to add expense");
      setSuggestions((prev) => prev.filter((_, i) => i !== index));
      if (isToday) await loadExpenses(selectedDate);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setAddingSuggestion(null);
    }
  }

  async function loadExpenses(date: string) {
    if (!profile) return;
    setLoading(true);
    const { from, to } = localDayRangeUtc(date);
    const res = await fetch(
      `/api/expenses?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&userId=${profile.id}`
    );
    const data = await res.json();
    setExpenses(data.expenses ?? []);
    setLoading(false);
  }

  useEffect(() => {
    if (profile) loadExpenses(selectedDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, profile]);

  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  async function finalizeDelete(expense: Expense) {
    if (!profile) return;
    try {
      await fetch(`/api/expenses/${expense.id}?userId=${profile.id}`, { method: "DELETE" });
    } catch {
      // best-effort: the row is already gone from the UI either way
    }
  }

  function handleDelete(expense: Expense) {
    if (pendingDelete) {
      clearTimeout(pendingDelete.timer);
      finalizeDelete(pendingDelete.expense);
    }
    setExpenses((prev) => prev.filter((e) => e.id !== expense.id));
    if (editing?.id === expense.id) setEditing(null);

    const timer = setTimeout(() => {
      finalizeDelete(expense);
      setPendingDelete(null);
    }, 5000);
    setPendingDelete({ expense, timer });
  }

  function handleUndoDelete() {
    if (!pendingDelete) return;
    clearTimeout(pendingDelete.timer);
    setExpenses((prev) =>
      [...prev, pendingDelete.expense].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    );
    setPendingDelete(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!profile) return;

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("Enter a valid amount");
      return;
    }
    if (!category) {
      setError("Select a category");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parsedAmount,
          category,
          paymentMode,
          note,
          userId: profile.id,
          isRecurring: repeatMonthly,
          createdAt: isoTimestampForLocalDate(selectedDate),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to save expense");
      }
      setAmount("");
      setCategory(null);
      setNote("");
      setRepeatMonthly(false);
      await loadExpenses(selectedDate);
      if (repeatMonthly) await loadSuggestions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(expense: Expense) {
    setEditError(null);
    const date = toISODate(new Date(expense.created_at));
    setEditing({
      id: expense.id,
      amount: String(expense.amount),
      category: (CATEGORIES as readonly string[]).includes(expense.category)
        ? (expense.category as Category)
        : CATEGORIES[0],
      paymentMode: expense.payment_mode as PaymentMode,
      note: expense.note ?? "",
      date,
      originalDate: date,
    });
  }

  async function saveEdit() {
    if (!editing || !profile) return;
    const parsedAmount = Number(editing.amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setEditError("Enter a valid amount");
      return;
    }

    setSavingEdit(true);
    setEditError(null);
    try {
      const res = await fetch(`/api/expenses/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parsedAmount,
          category: editing.category,
          paymentMode: editing.paymentMode,
          note: editing.note,
          userId: profile.id,
          createdAt:
            editing.date === editing.originalDate
              ? undefined
              : isoTimestampForLocalDate(editing.date),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to save expense");
      }
      setEditing(null);
      await loadExpenses(selectedDate);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSavingEdit(false);
    }
  }

  if (!ready || !isAuthenticated || !profile) return null;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8 px-5 py-8">
      <header className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <span className="label-stamp text-xs text-muted uppercase">
              {formatDateLabel(selectedDate)}
            </span>
            <h1 className="font-serif text-3xl text-foreground">Hi {profile.name}!</h1>
          </div>

          <div className="relative mt-0.5">
            <input
              type="date"
              value={selectedDate}
              max={todayIso}
              onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
              aria-label="Pick a date"
              className="absolute inset-0 h-9 w-9 cursor-pointer opacity-0"
            />
            <div className="pointer-events-none flex h-9 w-9 items-center justify-center rounded-full border border-border">
              <Calendar className="h-4 w-4 text-accent" strokeWidth={2} />
            </div>
          </div>
        </div>

        <p className="text-[15px] text-muted">
          You&apos;ve spent{" "}
          <span className="font-serif font-semibold text-accent">₹{total.toFixed(2)}</span>{" "}
          {isToday ? "today." : "on this day."}
        </p>

        {!isToday && (
          <button
            type="button"
            onClick={() => setSelectedDate(todayIso)}
            className="w-fit text-xs font-medium tracking-wide text-accent uppercase underline underline-offset-2"
          >
            Back to Today
          </button>
        )}
      </header>

      {isToday && suggestions.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="label-stamp text-xs text-muted uppercase">Recurring</h2>
          <ul className="flex flex-col border border-border">
            {suggestions.map((s, index) => {
              const Icon = CATEGORY_ICON[s.category as Category];
              return (
                <li
                  key={`${s.category}-${s.note ?? ""}`}
                  className="flex min-h-12 items-center gap-3 border-b border-border px-4 py-3 last:border-b-0"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border">
                    {Icon ? (
                      <Icon className="h-3.5 w-3.5 text-accent" strokeWidth={2} />
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                    )}
                  </span>
                  <div className="flex flex-1 flex-col">
                    <span className="font-serif text-foreground">{s.category}</span>
                    <span className="text-xs text-muted">
                      {s.note ? `${s.note} · ` : ""}₹{Number(s.amount).toFixed(2)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddSuggestion(s, index)}
                    disabled={addingSuggestion === index}
                    aria-label={`Add ${s.category} expense`}
                    className="flex items-center gap-1 rounded-full border border-accent/40 px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent-soft disabled:opacity-50"
                  >
                    <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                    {addingSuggestion === index ? "Adding..." : "Add"}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-[15px] border border-border px-5 py-5"
      >
        <div className="relative w-fit">
          <input
            type="date"
            value={selectedDate}
            max={todayIso}
            onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
            aria-label="Change the date this expense is added for"
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
          <span className="pointer-events-none flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-medium tracking-wide text-accent uppercase">
            {formatChipDate(selectedDate)}
            <ChevronDown className="h-3 w-3" strokeWidth={2} />
          </span>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="amount" className="label-stamp text-xs text-muted uppercase">
            Amount
          </label>
          <input
            id="amount"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            placeholder="₹0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border border-border bg-background px-3 py-3 font-serif text-2xl text-foreground placeholder:text-muted/50 focus:border-accent focus:outline-none"
            required
          />
        </div>

        <div className="flex gap-4">
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <label htmlFor="category" className="label-stamp text-xs text-muted uppercase">
              Category
            </label>
            <Select
              id="category"
              value={category}
              onChange={setCategory}
              options={CATEGORY_OPTIONS}
              placeholder="Select category"
            />
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <label htmlFor="paymentMode" className="label-stamp text-xs text-muted uppercase">
              Payment
            </label>
            <Select
              id="paymentMode"
              value={paymentMode}
              onChange={setPaymentMode}
              options={PAYMENT_OPTIONS}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="note" className="label-stamp text-xs text-muted uppercase">
            Note <span className="normal-case text-muted/60">(optional)</span>
          </label>
          <input
            id="note"
            type="text"
            placeholder="e.g. weekly vegetables"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="border-b border-border bg-transparent pb-1.5 text-foreground placeholder:text-muted/50 focus:border-accent focus:outline-none"
          />
        </div>

        <label className="flex w-fit cursor-pointer items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={repeatMonthly}
            onChange={(e) => setRepeatMonthly(e.target.checked)}
            className="sr-only"
          />
          <span
            className={`flex h-4 w-4 shrink-0 items-center justify-center border ${
              repeatMonthly ? "border-accent bg-accent" : "border-foreground/30"
            }`}
          >
            {repeatMonthly && <Check className="h-3 w-3 text-background" strokeWidth={3} />}
          </span>
          Repeat this monthly
        </label>

        {error && <p className="text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-1 rounded-full bg-accent px-4 py-2.5 font-medium text-background transition-colors hover:bg-accent/90 disabled:opacity-50"
        >
          {submitting ? "Adding..." : "Add expense"}
        </button>
      </form>

      <div className="flex flex-col">
        <h2 className="label-stamp mb-1 text-xs text-muted uppercase">
          {isToday ? "Today's expenses" : "Expenses"}
        </h2>
        {loading ? (
          <p className="py-3 text-sm text-muted/70">Loading...</p>
        ) : expenses.length === 0 ? (
          <p className="py-3 text-sm text-muted/70">No expenses on this day.</p>
        ) : (
          <ul className="flex flex-col">
            {expenses.map((e) => {
              const Icon = CATEGORY_ICON[e.category as Category];
              const isRowEditing = editing?.id === e.id;
              return (
                <li key={e.id} className="min-h-12 border-t border-border py-3 last:border-b">
                  {isRowEditing ? (
                    <div className="flex flex-col gap-3">
                      <div className="relative w-fit">
                        <input
                          type="date"
                          value={editing.date}
                          max={todayIso}
                          onChange={(ev) =>
                            ev.target.value && setEditing({ ...editing, date: ev.target.value })
                          }
                          aria-label="Change this expense's date"
                          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                        />
                        <span className="pointer-events-none flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-medium tracking-wide text-accent uppercase">
                          {formatChipDate(editing.date)}
                          <ChevronDown className="h-3 w-3" strokeWidth={2} />
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          inputMode="decimal"
                          step="0.01"
                          min="0"
                          value={editing.amount}
                          onChange={(ev) => setEditing({ ...editing, amount: ev.target.value })}
                          className="w-24 border border-border bg-background px-2.5 py-2 font-serif text-foreground focus:border-accent focus:outline-none"
                        />
                        <div className="flex-1">
                          <Select
                            value={editing.category}
                            onChange={(v) => setEditing({ ...editing, category: v })}
                            options={CATEGORY_OPTIONS}
                          />
                        </div>
                      </div>
                      <Select
                        value={editing.paymentMode}
                        onChange={(v) => setEditing({ ...editing, paymentMode: v })}
                        options={PAYMENT_OPTIONS}
                      />
                      <input
                        type="text"
                        placeholder="Note (optional)"
                        value={editing.note}
                        onChange={(ev) => setEditing({ ...editing, note: ev.target.value })}
                        className="border-b border-border bg-transparent pb-1.5 text-sm text-foreground placeholder:text-muted/50 focus:border-accent focus:outline-none"
                      />
                      {editError && <p className="text-xs text-red-700">{editError}</p>}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={saveEdit}
                          disabled={savingEdit}
                          className="flex-1 bg-accent px-3 py-2 text-sm font-medium text-background transition-colors hover:bg-accent/90 disabled:opacity-50"
                        >
                          {savingEdit ? "Saving..." : "Save"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditing(null)}
                          className="flex-1 border border-border px-3 py-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border">
                        {Icon ? (
                          <Icon className="h-3.5 w-3.5 text-accent" strokeWidth={2} />
                        ) : (
                          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                        )}
                      </span>
                      <div className="flex flex-1 flex-col">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="font-serif text-foreground">{e.category}</span>
                          <span className="font-serif tabular-nums text-foreground">
                            ₹{Number(e.amount).toFixed(2)}
                          </span>
                        </div>
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                          <Pill icon={PAYMENT_ICON[e.payment_mode as PaymentMode]} label={e.payment_mode} />
                          {e.note && <Pill label={e.note} />}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() => startEdit(e)}
                          aria-label="Edit expense"
                          className="flex h-6 w-6 items-center justify-center text-muted transition-colors hover:text-accent"
                        >
                          <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(e)}
                          aria-label="Delete expense"
                          className="flex h-6 w-6 items-center justify-center text-muted transition-colors hover:text-red-700"
                        >
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
            <li className="flex min-h-12 items-baseline justify-between border-t-2 border-foreground pt-3">
              <span className="label-stamp text-xs text-muted uppercase">
                Total Spent
              </span>
              <span className="font-serif text-lg font-semibold text-accent tabular-nums">
                ₹{total.toFixed(2)}
              </span>
            </li>
          </ul>
        )}
      </div>

      {pendingDelete && (
        <div className="fixed inset-x-0 bottom-24 z-20 flex justify-center px-5">
          <div className="flex items-center gap-4 border border-border bg-surface px-4 py-3 shadow-lg">
            <span className="text-sm text-foreground">Expense deleted</span>
            <button
              type="button"
              onClick={handleUndoDelete}
              className="text-sm font-medium text-accent underline underline-offset-2"
            >
              Undo
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
