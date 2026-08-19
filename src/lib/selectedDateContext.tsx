"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { toISODate } from "./date";

type SelectedDateState = {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  todayIso: string;
};

const SelectedDateContext = createContext<SelectedDateState | null>(null);

export function SelectedDateProvider({ children }: { children: ReactNode }) {
  const [todayIso] = useState(() => toISODate(new Date()));
  const [selectedDate, setSelectedDate] = useState(todayIso);

  const value = useMemo(
    () => ({ selectedDate, setSelectedDate, todayIso }),
    [selectedDate, todayIso]
  );

  return (
    <SelectedDateContext.Provider value={value}>{children}</SelectedDateContext.Provider>
  );
}

export function useSelectedDate() {
  const ctx = useContext(SelectedDateContext);
  if (!ctx) throw new Error("useSelectedDate must be used within SelectedDateProvider");
  return ctx;
}
