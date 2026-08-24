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

// UTC instant bounds for the local calendar month containing the given
// date. Same rationale as localDayRangeUtc — avoids server-timezone drift.
export function localMonthRangeUtc(iso: string): { from: string; to: string } {
  const d = parseISODate(iso);
  const start = new Date(d.getFullYear(), d.getMonth(), 1);
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
  return { from: start.toISOString(), to: end.toISOString() };
}

// UTC instant bounds for the local calendar month immediately before the
// one containing the given date.
export function localPreviousMonthRangeUtc(iso: string): { from: string; to: string } {
  const d = parseISODate(iso);
  const start = new Date(d.getFullYear(), d.getMonth() - 1, 1);
  const end = new Date(d.getFullYear(), d.getMonth(), 1);
  return { from: start.toISOString(), to: end.toISOString() };
}

// UTC instant bounds for the Monday-Sunday calendar week containing the
// given date. Same rationale as localDayRangeUtc/localMonthRangeUtc.
export function localWeekRangeUtc(iso: string): { from: string; to: string } {
  const d = parseISODate(iso);
  const mondayOffset = (d.getDay() + 6) % 7; // 0 = Monday ... 6 = Sunday
  const start = new Date(d);
  start.setDate(d.getDate() - mondayOffset);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return { from: start.toISOString(), to: end.toISOString() };
}

// Attaches the current wall-clock time to a "YYYY-MM-DD" local date, so a
// backdated expense still sorts sensibly within its day instead of landing
// at local midnight. Returns a UTC ISO string.
export function isoTimestampForLocalDate(iso: string): string {
  const now = new Date();
  const d = parseISODate(iso);
  d.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
  return d.toISOString();
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
