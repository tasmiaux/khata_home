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

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 px-5 pb-4">
      <div className="mx-auto flex w-full max-w-md items-center justify-center gap-1 rounded-[28px] bg-surface/95 p-1.5 shadow-nav backdrop-blur">
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
    </nav>
  );
}
