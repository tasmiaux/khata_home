"use client";

import { useEffect, useRef, useState, FormEvent } from "react";
import { CATEGORIES, PAYMENT_MODES, type Category, type PaymentMode } from "@/lib/constants";
import { CATEGORY_ICON, PAYMENT_ICON } from "@/lib/categoryVisuals";
import Select from "@/components/Select";
import { toISODate, formatDateLabel } from "@/lib/date";
import { Calendar, Pencil, Trash2 } from "lucide-react";

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

export default function Home() {
  const [todayIso] = useState(() => toISODate(new Date()));
  const [selectedDate, setSelectedDate] = useState(todayIso);
  const isToday = selectedDate === todayIso;

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Category>(CATEGORIES[0]);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>(PAYMENT_MODES[0]);
  const [note, setNote] = useState("");

  const formRef = useRef<HTMLFormElement>(null);

  async function loadExpenses(date: string) {
    setLoading(true);
    const res = await fetch(`/api/expenses?date=${date}`);
    const data = await res.json();
    setExpenses(data.expenses ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadExpenses(selectedDate);
  }, [selectedDate]);

  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  function resetForm() {
    setEditingId(null);
    setAmount("");
    setCategory(CATEGORIES[0]);
    setPaymentMode(PAYMENT_MODES[0]);
    setNote("");
    setError(null);
  }

  function startEdit(expense: Expense) {
    setEditingId(expense.id);
    setAmount(String(expense.amount));
    setCategory((CATEGORIES as readonly string[]).includes(expense.category)
      ? (expense.category as Category)
      : CATEGORIES[0]);
    setPaymentMode(expense.payment_mode as PaymentMode);
    setNote(expense.note ?? "");
    setError(null);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleDelete(id: number) {
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete expense");
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      if (editingId === id) resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("Enter a valid amount");
      return;
    }

    setSubmitting(true);
    try {
      const isEditing = editingId !== null;
      const res = await fetch(isEditing ? `/api/expenses/${editingId}` : "/api/expenses", {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parsedAmount, category, paymentMode, note }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to save expense");
      }
      if (isEditing) {
        resetForm();
      } else {
        setAmount("");
        setNote("");
      }
      await loadExpenses(selectedDate);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  const isEditing = editingId !== null;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8 px-5 py-8">
      <header className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium tracking-wide text-muted uppercase">
              {formatDateLabel(selectedDate)}
            </span>
            <h1 className="font-serif text-3xl text-foreground">Hi Fatima!</h1>
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

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 border border-border px-5 py-5"
      >
        {isEditing && (
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium tracking-wide text-accent uppercase">
              Editing entry
            </span>
            <button
              type="button"
              onClick={resetForm}
              className="text-xs font-medium tracking-wide text-muted uppercase underline underline-offset-2 hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="amount" className="text-xs font-medium tracking-wide text-muted uppercase">
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
          <div className="flex flex-1 flex-col gap-1.5">
            <label htmlFor="category" className="text-xs font-medium tracking-wide text-muted uppercase">
              Category
            </label>
            <Select id="category" value={category} onChange={setCategory} options={CATEGORY_OPTIONS} />
          </div>

          <div className="flex flex-1 flex-col gap-1.5">
            <label htmlFor="paymentMode" className="text-xs font-medium tracking-wide text-muted uppercase">
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
          <label htmlFor="note" className="text-xs font-medium tracking-wide text-muted uppercase">
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

        {error && <p className="text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-1 bg-accent px-4 py-2.5 font-medium text-background transition-colors hover:bg-accent/90 disabled:opacity-50"
        >
          {submitting ? (isEditing ? "Saving..." : "Adding...") : isEditing ? "Save changes" : "Add expense"}
        </button>
      </form>

      <div className="flex flex-col">
        <h2 className="mb-1 text-xs font-medium tracking-wide text-muted uppercase">
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
              return (
                <li
                  key={e.id}
                  className="flex items-start gap-3 border-t border-border py-3 last:border-b"
                >
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
                      <span className="border border-border px-1.5 py-0.5 text-[11px] text-muted">
                        {e.payment_mode}
                      </span>
                      {e.note && (
                        <span className="border border-border px-1.5 py-0.5 text-[11px] text-muted italic">
                          {e.note}
                        </span>
                      )}
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
                      onClick={() => handleDelete(e.id)}
                      aria-label="Delete expense"
                      className="flex h-6 w-6 items-center justify-center text-muted transition-colors hover:text-red-700"
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                    </button>
                  </div>
                </li>
              );
            })}
            <li className="flex items-baseline justify-between border-t-2 border-foreground pt-3">
              <span className="text-xs font-medium tracking-wide text-muted uppercase">
                Total Spent
              </span>
              <span className="font-serif text-lg font-semibold text-accent tabular-nums">
                ₹{total.toFixed(2)}
              </span>
            </li>
          </ul>
        )}
      </div>
    </main>
  );
}
