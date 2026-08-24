"use client";

import { useState, useEffect, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getProfiles, getLastActiveProfile, login, isValidPin, type Profile } from "@/lib/auth";
import { useAuth } from "@/lib/authContext";
import Avatar from "@/components/Avatar";

type Mode = "loading" | "empty" | "picker" | "form";

export default function LoginForm({ forceSwitch = false }: { forceSwitch?: boolean }) {
  const [mode, setMode] = useState<Mode>("loading");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selected, setSelected] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { refresh } = useAuth();

  useEffect(() => {
    const all = getProfiles();
    setProfiles(all);
    if (all.length === 0) {
      setMode("empty");
      return;
    }
    const preferred = forceSwitch
      ? null
      : (getLastActiveProfile() ?? (all.length === 1 ? all[0] : null));
    if (preferred) {
      selectProfile(preferred);
    } else {
      setMode("picker");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceSwitch]);

  function selectProfile(profile: Profile) {
    setSelected(profile);
    setName(profile.name);
    setPin("");
    setError(null);
    setMode("form");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!selected) return;
    if (!isValidPin(pin)) {
      setError("Enter your 4-digit PIN");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      if (await login(selected.id, name, pin)) {
        refresh();
        router.replace("/");
      } else {
        setError("That name/PIN doesn't match this profile.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  const registerHref = forceSwitch ? "/register/switch" : "/register";

  function handleSwitchProfile() {
    if (profiles.length > 1) {
      setMode("picker");
    } else {
      router.push(registerHref);
    }
  }

  const inputClass =
    "border border-border bg-background px-3 py-2.5 text-foreground placeholder:text-muted/50 focus:border-accent focus:outline-none";
  const labelClass = "label-stamp text-xs text-muted uppercase";

  if (mode === "loading") return null;

  if (mode === "empty") {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-5 py-8">
        <header className="flex flex-col gap-1">
          <h1 className="font-serif text-3xl text-foreground">No profile yet</h1>
          <p className="text-[15px] text-muted">
            This device doesn&apos;t have a Khata profile set up.
          </p>
        </header>
        <Link
          href={registerHref}
          className="w-fit bg-accent px-4 py-2.5 font-medium text-background transition-colors hover:bg-accent/90"
        >
          Create one
        </Link>
      </main>
    );
  }

  if (mode === "picker") {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-8 px-5 py-8">
        <header className="flex flex-col gap-1">
          <h1 className="font-serif text-3xl text-foreground">Welcome back to your khata</h1>
          <p className="text-[15px] text-muted">Pick a profile on this device to continue.</p>
        </header>

        <ul className="flex flex-col border border-border">
          {profiles.map((p) => (
            <li key={p.id} className="border-b border-border last:border-b-0">
              <button
                type="button"
                onClick={() => selectProfile(p)}
                className="flex min-h-12 w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-accent-soft"
              >
                <Avatar name={p.name} />
                <span className="font-serif text-foreground">{p.name}</span>
              </button>
            </li>
          ))}
        </ul>

        <Link
          href={registerHref}
          className="text-center text-sm text-accent underline underline-offset-2"
        >
          Register a new profile
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
          <label htmlFor="pin" className={labelClass}>
            PIN
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
            className="border border-border bg-background py-2.5 pl-3 pr-6 tracking-[0.4em] text-foreground placeholder:text-muted/50 focus:border-accent focus:outline-none"
            required
          />
        </div>

        {error && <p className="text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-1 bg-accent px-4 py-2.5 font-medium text-background transition-colors hover:bg-accent/90 disabled:opacity-50"
        >
          {submitting ? "Logging in..." : "Log in"}
        </button>
      </form>

      <button
        type="button"
        onClick={handleSwitchProfile}
        className="text-center text-sm text-muted underline underline-offset-2 hover:text-foreground"
      >
        Not {selected?.name}? Switch to a different profile
      </button>
    </main>
  );
}
