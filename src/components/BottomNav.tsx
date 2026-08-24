"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PieChart, Calculator } from "lucide-react";

const ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: PieChart },
  { href: "/calculator", label: "Calculator", icon: Calculator },
] as const;

const HIDDEN_ON = ["/login", "/login/switch", "/register", "/register/switch"];

export default function BottomNav() {
  const pathname = usePathname();

  if (HIDDEN_ON.includes(pathname) || pathname.startsWith("/shared/")) return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-background/95 px-5 py-3 backdrop-blur">
      <div className="mx-auto flex w-full max-w-md items-center justify-center gap-1 rounded-full border border-border p-1.5">
        {ITEMS.map((item) => {
          const isActive = item.href === pathname;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 items-center justify-center gap-1 rounded-full px-2.5 py-2 text-xs font-medium transition-colors sm:text-sm ${
                isActive ? "bg-accent text-background" : "text-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
