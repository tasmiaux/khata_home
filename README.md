# Khata — a home expense ledger

Khata (खाता, "ledger" in Hindi/Urdu) is a single-page expense tracker built
for manual, no-bank-linking home budgeting. Add an expense in a few taps,
see your running total instantly, and browse any past day — styled like a
digitized ledger book.

## Features

- **Quick expense entry** — amount, category (11 household-specific options),
  payment mode (Cash / UPI / Card), and an optional note.
- **Edit & delete** — fix a mistaken entry or remove one, right from the list.
- **Date browser** — a calendar picker lets you view any previous day's
  spending, not just today's.
- **Dashboard** — category-wise breakdown with a donut chart; switch between
  Today (live data), Weekly, and Monthly views.
  > Weekly/Monthly currently use placeholder data — see `TODO` in
  > `src/app/dashboard/page.tsx` for the real aggregation query to build.
- **Calculator** — a built-in quick-math tool for on-the-fly totals.

## Tech stack

- Next.js (App Router) + TypeScript
- Tailwind CSS v4
- Postgres via [Neon](https://neon.tech), accessed with `pg`
- Lucide icons

## Getting started

1. Create a free Postgres database at neon.tech and copy the connection string.
2. Add it to `.env.local`:
