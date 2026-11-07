import type { LucideIcon } from "lucide-react";

export default function Pill({
  icon: Icon,
  label,
  className = "",
}: {
  icon?: LucideIcon;
  label: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-field border border-border/60 px-2.5 py-1 text-[11px] font-medium text-muted ${className}`}
    >
      {Icon && <Icon className="h-3 w-3 shrink-0 text-accent" strokeWidth={2} />}
      {label}
    </span>
  );
}
