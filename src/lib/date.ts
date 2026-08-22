export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Parses a "YYYY-MM-DD" string as a local date (avoids the UTC-midnight
// shift you get from `new Date(isoString)`).
export function parseISODate(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

// UTC instant bounds for a local calendar date, expressed in the caller's
// own timezone (via parseISODate's local-midnight construction). Filtering
// by this range instead of casting created_at::date server-side avoids a
// day-boundary mismatch when the browser's timezone differs from the
// database session's (e.g. IST vs Postgres's UTC default).
export function localDayRangeUtc(iso: string): { from: string; to: string } {
  const start = parseISODate(iso);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { from: start.toISOString(), to: end.toISOString() };
}

// e.g. "Friday, 15 August"
export function formatDateLabel(iso: string): string {
  return parseISODate(iso).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

// e.g. "15 August"
export function formatShortDate(iso: string): string {
  return parseISODate(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
  });
}
