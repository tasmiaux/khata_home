"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/authContext";
import { logout, resetDevice } from "@/lib/auth";
import Avatar from "@/components/Avatar";

export default function AccountsPage() {
  const { profile, refresh } = useAuth();

  function handleLogout() {
    logout();
    refresh();
  }

  function handleResetDevice() {
    if (
      !window.confirm(
        "Reset this device? Every profile on this device will be forgotten. This can't be undone here — you'd need to register again."
      )
    ) {
      return;
    }
    resetDevice();
    refresh();
  }

  if (!profile) return null;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8 px-5 py-8">
      <Link
        href="/"
        className="flex w-fit items-center gap-1.5 text-xs font-medium tracking-wide text-muted uppercase transition-colors hover:text-accent"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
        Back to Home
      </Link>

      <header className="flex items-center gap-3">
        <Avatar name={profile.name} className="h-12 w-12 text-lg" />
        <h1 className="font-serif text-3xl text-foreground">{profile.name}</h1>
      </header>

      <ul className="flex flex-col border border-border">
        <li className="border-b border-border">
          <Link
            href="/login/switch"
            className="flex min-h-12 w-full items-center px-5 py-3 text-left font-serif text-foreground transition-colors hover:bg-accent-soft"
          >
            Switch profile
          </Link>
        </li>
        <li>
          <button
            type="button"
            onClick={handleLogout}
            className="flex min-h-12 w-full items-center px-5 py-3 text-left font-serif text-foreground transition-colors hover:bg-accent-soft"
          >
            Log out
          </button>
        </li>
      </ul>

      <button
        type="button"
        onClick={handleResetDevice}
        className="w-fit text-sm font-medium text-red-700 underline underline-offset-2"
      >
        Reset this device
      </button>
    </main>
  );
}
