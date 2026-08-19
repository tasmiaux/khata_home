"use client";

import { useState, useEffect, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getProfile, login, resetProfile, type Profile } from "@/lib/auth";
import { useAuth } from "@/lib/authContext";

export default function LoginPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { refresh } = useAuth();

  useEffect(() => {
    const p = getProfile();
    setProfile(p);
    if (p) setName(p.name);
  }, []);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (login(name, password)) {
      refresh();
      router.replace("/");
    } else {
      setError("That name/password doesn't match this device's profile.");
    }
  }

  function handleReset() {
    resetProfile();
    router.replace("/register");
  }

  const inputClass =
    "border border-border bg-background px-3 py-2.5 text-foreground placeholder:text-muted/50 focus:border-accent focus:outline-none";
  const labelClass = "text-xs font-medium tracking-wide text-muted uppercase";

  if (!profile) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-5 py-8">
        <header className="flex flex-col gap-1">
          <h1 className="font-serif text-3xl text-foreground">No profile yet</h1>
          <p className="text-[15px] text-muted">
            This device doesn&apos;t have a Khata profile set up.
          </p>
        </header>
        <Link
          href="/register"
          className="w-fit bg-accent px-4 py-2.5 font-medium text-background transition-colors hover:bg-accent/90"
        >
          Create one
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-8 px-5 py-8">
      <header className="flex flex-col gap-1">
        <h1 className="font-serif text-3xl text-foreground">Welcome back to your khata</h1>
        <p className="text-[15px] text-muted">Pick up right where your ledger left off.</p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 border border-border px-5 py-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className={labelClass}>
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className={labelClass}>
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder={profile.password ? "••••••••" : "(none set)"}
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
          Log in
        </button>
      </form>

      <button
        type="button"
        onClick={handleReset}
        className="text-center text-sm text-muted underline underline-offset-2 hover:text-foreground"
      >
        Not {profile.name}? Reset this device and register a new profile
      </button>
    </main>
  );
}
