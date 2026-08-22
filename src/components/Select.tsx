"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check, type LucideIcon } from "lucide-react";

export type SelectOption<T extends string> = {
  value: T;
  label: string;
  icon?: LucideIcon;
};

type SelectProps<T extends string> = {
  id?: string;
  value: T;
  onChange: (value: T) => void;
  options: readonly SelectOption<T>[];
};

export default function Select<T extends string>({ id, value, onChange, options }: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = options.find((o) => o.value === value);
  const SelectedIcon = selected?.icon;

  return (
    <div ref={rootRef} className="relative">
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-full border border-foreground/20 bg-background px-4 py-2 text-left text-foreground transition-colors hover:border-accent/50 focus:border-accent focus:outline-none"
      >
        <span className="flex items-center gap-2 truncate">
          {SelectedIcon && <SelectedIcon className="h-4 w-4 shrink-0 text-accent" strokeWidth={2} />}
          <span className="truncate">{selected?.label}</span>
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
          strokeWidth={2}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute z-20 mt-1.5 max-h-64 w-full overflow-y-auto rounded-2xl border border-border bg-background p-1 shadow-lg"
        >
          {options.map((option) => {
            const Icon = option.icon;
            const isSelected = option.value === value;
            return (
              <li key={option.value} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-2 rounded-full px-3 py-2 text-left text-sm transition-colors hover:bg-accent-soft ${
                    isSelected ? "font-medium text-accent" : "text-foreground"
                  }`}
                >
                  {Icon && <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />}
                  <span className="flex-1 truncate">{option.label}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
