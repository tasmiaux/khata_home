"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { register, isValidPin } from "@/lib/auth";
import { useAuth } from "@/lib/authContext";

export default function RegisterForm() {
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { refresh } = useAuth();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Enter your name");
      return;
    }
    if (!isValidPin(pin)) {
      setError("PIN must be exactly 4 digits");
      return;
    }
    if (pin !== confirmPin) {
      setError("PINs don't match");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await register({ name: name.trim(), pin });
      refresh();
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "border border-border bg-background px-3 py-2.5 text-foreground placeholder:text-muted/50 focus:border-accent focus:outline-none";
  const labelClass = "label-stamp text-xs text-muted uppercase";
  // Letter-spacing on an input isn't reserved after the last character, so
  // a plain tracking-* class clips/overflows the final digit against the
  // padding edge — extra right padding compensates for that trailing gap.
  const pinInputClass =
    "w-full border border-border bg-background py-2.5 pl-3 pr-6 tracking-[0.4em] text-foreground placeholder:text-muted/50 focus:border-accent focus:outline-none";

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-8 px-5 py-8">
      <header className="flex flex-col gap-1">
        <h1 className="font-serif text-3xl text-foreground">Your household, your ledger.</h1>
        <p className="text-[15px] text-muted">
          Every home keeps a khata. Let&apos;s set up yours.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 border border-border px-5 py-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className={labelClass}>
            Name
          </label>
          <input
            id="name"
            type="text"
            placeholder="e.g. Fatima"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex min-w-0 flex-col gap-1.5">
            <label htmlFor="pin" className={labelClass}>
              4-digit PIN
            </label>
            <input
              id="pin"
              type="password"
              inputMode="numeric"
              pattern="\d{4}"
              maxLength={4}
              placeholder="••••"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              className={pinInputClass}
              required
            />
          </div>

          <div className="flex min-w-0 flex-col gap-1.5">
            <label htmlFor="confirmPin" className={labelClass}>
              Confirm PIN
            </label>
            <input
              id="confirmPin"
              type="password"
              inputMode="numeric"
              pattern="\d{4}"
              maxLength={4}
              placeholder="••••"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              className={pinInputClass}
              required
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-1 bg-accent px-4 py-2.5 font-medium text-background transition-colors hover:bg-accent/90 disabled:opacity-50"
        >
          {submitting ? "Creating..." : "Create account"}
        </button>
      </form>

      <p className="text-center text-sm text-muted">
        Already set up on this device?{" "}
        <Link href="/login" className="text-accent underline underline-offset-2">
          Log in
        </Link>
      </p>
    </main>
  );
}
