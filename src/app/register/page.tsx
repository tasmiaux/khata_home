"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { register } from "@/lib/auth";
import { useAuth } from "@/lib/authContext";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { refresh } = useAuth();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Enter your name");
      return;
    }
    register({
      name: name.trim(),
      email: email.trim() || undefined,
      password: password || undefined,
    });
    refresh();
    router.replace("/");
  }

  const inputClass =
    "border border-border bg-background px-3 py-2.5 text-foreground placeholder:text-muted/50 focus:border-accent focus:outline-none";
  const labelClass = "text-xs font-medium tracking-wide text-muted uppercase";

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

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className={labelClass}>
            Email <span className="normal-case text-muted/60">(optional)</span>
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className={labelClass}>
            Password <span className="normal-case text-muted/60">(optional)</span>
          </label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </div>

        {error && <p className="text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          className="mt-1 bg-accent px-4 py-2.5 font-medium text-background transition-colors hover:bg-accent/90"
        >
          Create account
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
