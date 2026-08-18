"use client";

import { useEffect, useState } from "react";
import { Lightbulb } from "lucide-react";

export default function SavingsNudgeCard() {
  const [tip, setTip] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/savings-nudge")
      .then((res) => res.json())
      .then((data) => setTip(data.tip ?? null))
      .catch(() => setTip(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-1.5 rounded-2xl bg-accent-soft px-4 py-4">
      <div className="flex items-center gap-1.5">
        <Lightbulb className="h-3.5 w-3.5 text-accent" strokeWidth={2} />
        <span className="text-xs font-medium tracking-wide text-accent uppercase">
          Savings Nudge
        </span>
      </div>
      <p className="font-serif text-[15px] leading-relaxed text-foreground">
        {loading ? "Finding today's tip..." : tip}
      </p>
    </div>
  );
}
