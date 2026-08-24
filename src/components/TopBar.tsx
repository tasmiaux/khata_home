"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import Avatar from "./Avatar";

// The wordmark lives in the page content itself on Welcome (centered, above
// the headline) instead of the top bar.
const HIDDEN_ON = ["/welcome"];

export default function TopBar() {
  const { isAuthenticated, profile } = useAuth();
  const pathname = usePathname();

  if (HIDDEN_ON.includes(pathname)) return null;

  return (
    <div className="flex items-center justify-between border-b border-border px-5 py-3">
      <div className="flex items-baseline gap-0.5 font-hand text-xl leading-none">
        <span className="text-accent">खा</span>
        <span className="text-foreground">ta</span>
      </div>
      {isAuthenticated && profile && (
        <Link
          href="/accounts"
          className="flex items-center gap-2 rounded-full border border-border py-1 pr-3 pl-1 text-xs font-medium tracking-wide text-muted uppercase transition-colors hover:border-accent/50 hover:text-accent"
        >
          <Avatar name={profile.name} className="h-6 w-6 text-[11px]" />
          {profile.name}
        </Link>
      )}
    </div>
  );
}
