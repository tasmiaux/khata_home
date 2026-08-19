"use client";

import { useAuth } from "@/lib/authContext";
import { logout } from "@/lib/auth";

export default function TopBar() {
  const { isAuthenticated, refresh } = useAuth();

  function handleLogout() {
    logout();
    refresh();
  }

  return (
    <div className="flex items-center justify-between border-b border-border px-5 py-3">
      <div className="flex items-baseline gap-0.5 font-hand text-xl leading-none">
        <span className="text-accent">खा</span>
        <span className="text-foreground">ta</span>
      </div>
      {isAuthenticated && (
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-full border border-border px-3 py-1 text-xs font-medium tracking-wide text-muted uppercase transition-colors hover:border-accent/50 hover:text-accent"
        >
          Log out
        </button>
      )}
    </div>
  );
}
