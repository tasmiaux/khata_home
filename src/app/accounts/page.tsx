"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/authContext";
import { logout } from "@/lib/auth";
import Avatar from "@/components/Avatar";

export default function AccountsPage() {
  const { profile, refresh } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    await refresh();
  }

  async function handleResetDevice() {
    await logout();
    await refresh();
    router.replace("/welcome");
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
        <div className="flex flex-col">
          <h1 className="font-serif text-3xl text-foreground">{profile.name}</h1>
          <span className="text-sm text-muted">{profile.email}</span>
        </div>
      </header>

      <div className="flex flex-col items-center gap-4">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-full border border-border px-4 py-2.5 text-center font-medium text-foreground transition-colors hover:bg-accent-soft"
        >
          Logout
        </button>

        <button
          type="button"
          onClick={handleResetDevice}
          className="text-sm text-red-700 underline underline-offset-2 transition-colors hover:text-red-800"
        >
          Reset device
        </button>
      </div>
    </main>
  );
}
