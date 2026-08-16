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
  > Weekly/Monthly currently use placeholder data — see the `TODO` in
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
   ```
   DATABASE_URL=postgresql://...
   ```
3. Install dependencies and set up the schema:
   ```bash
   npm install
   node scripts/init-db.mjs
   ```
4. Run the dev server:
   ```bash
   npm run dev
   ```
   Runs on `http://localhost:8080` (see `package.json`'s `dev` script).

## Deploying

1. Push this repo to GitHub.
2. Import it into [Vercel](https://vercel.com/new).
3. Add `DATABASE_URL` as an environment variable in the Vercel project
   settings, using the same Neon connection string from `.env.local`.
4. Deploy.

## Project structure

- `src/app/page.tsx` — Home (add/edit/delete, date browsing)
- `src/app/dashboard/page.tsx` — spending breakdown + chart
- `src/app/calculator/page.tsx` — calculator utility
- `src/app/api/expenses/` — REST API (GET/POST, PATCH/DELETE by id)
- `src/lib/` — shared constants, category→icon/color maps, date helpers
- `src/components/` — reusable UI (custom Select dropdown, bottom nav)
- `scripts/` — one-off DB setup/migration scripts

## Known limitations / next steps

- Weekly and Monthly dashboard tabs use mock data, not real date-range queries.
- No authentication — single-user by design.
- No backdating: new expenses are always timestamped "now," even if you're
  viewing a past date.
