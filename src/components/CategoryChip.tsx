import { CATEGORY_ICON, CATEGORY_TONE } from "@/lib/categoryVisuals";
import type { Category } from "@/lib/constants";

// A rounded, softly tinted icon tile for a category (colour comes from the
// category's family, see categoryVisuals.ts). Falls back to a neutral dot for a
// category name it doesn't know.
export default function CategoryChip({
  category,
  className = "",
}: {
  category: string;
  className?: string;
}) {
  const known = Object.hasOwn(CATEGORY_ICON, category);
  const Icon = known ? CATEGORY_ICON[category as Category] : null;
  const tone = known ? CATEGORY_TONE[category as Category] : { bg: "var(--track)", fg: "var(--muted)" };

  return (
    <span
      aria-hidden="true"
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${className}`}
      style={{ backgroundColor: tone.bg, color: tone.fg }}
    >
      {Icon ? (
        <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
      ) : (
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
      )}
    </span>
  );
}
