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
