"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PieChart, Calculator } from "lucide-react";

const ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: PieChart },
  { href: "/calculator", label: "Calculator", icon: Calculator },
] as const;

const HIDDEN_ON = ["/welcome", "/register"];

export default function BottomNav() {
  const pathname = usePathname();

  if (HIDDEN_ON.includes(pathname) || pathname.startsWith("/shared/")) return null;

  // The outer bar only adds a cream fade, so scrolling content slides under the nav
  // cleanly; it ignores pointer events so it never blocks taps on the page. The
  // inner column uses the same max-w-md + px-5 as the page content, so the nav lines
  // up with the cards above it.
  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-10 bg-gradient-to-t from-background via-background/90 to-transparent pt-8">
      <div className="mx-auto w-full max-w-md px-5 pb-4">
        <div className="pointer-events-auto flex w-full items-center justify-center gap-1 rounded-[28px] bg-surface p-1.5 shadow-nav">
          {ITEMS.map((item) => {
            const isActive = item.href === pathname;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex flex-1 flex-col items-center gap-0.5 rounded-[22px] px-2.5 py-2 text-[11px] font-medium transition-colors ${
                  isActive ? "bg-accent-soft text-accent" : "text-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" strokeWidth={2} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
