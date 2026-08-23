# Khata — a home expense ledger

Khata (खाता, "ledger" in Hindi/Urdu) is a single-page expense tracker built
for manual, no-bank-linking home budgeting. Add an expense in a few taps,
see your running total instantly, and browse any past day — styled like a
digitized ledger book.

## Features

- **Quick expense entry** — amount, category (18 household-specific options,
  grouped by home / food / lifestyle / health & education), payment mode
  (Cash / UPI / Card), and an optional note.
- **Inline edit & delete** — tap an entry to edit it right there in the list.
  Deleting shows an "Undo" toast for 5 seconds before it's actually removed.
- **Recurring expenses** — flag an expense "Repeat this monthly" (e.g. rent,
  college fee) and it resurfaces as a one-tap quick-add suggestion once
  logged for a new month.
- **Date browser** — a calendar picker on Home lets you view any previous
  day's spending. The Dashboard's "Today" tab follows the same selected
  date, so both stay in sync.
- **Dashboard** — category-wise breakdown with a donut chart; switch between
  Today (live data), Weekly, and Monthly views. Also shows a live
  month-over-month comparison line for the top spending category.
  > Weekly/Monthly tab data is still placeholder — see the `TODO` in
  > `src/app/dashboard/page.tsx` for the real aggregation query to build.
- **Share with Family** — generate a read-only summary link from the
  Dashboard (this month's total, remaining budget if set, category
  breakdown). Viewers don't need a Khata account to open it.
- **Calculator** — a built-in quick-math tool for on-the-fly totals.
- **Simple local login** — a lightweight name/email/password flow (no
  backend auth, no external provider) so the greeting is personalized and
  expenses stay separated per profile. Supports multiple profiles on the
  same device (e.g. different family members sharing a phone) with a
  profile picker on the login screen.

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
   node scripts/migrate-ledger.mjs
   node scripts/migrate-user-auth.mjs
   node scripts/migrate-shares.mjs
   node scripts/migrate-recurring.mjs
   ```
4. Run the dev server:
   ```bash
   npm run dev
   ```
   Runs on `http://localhost:8080` (see `package.json`'s `dev` script).
5. Open the app and register a profile — that's the only "setup" needed to
   start adding expenses.

## Deploying

1. Push this repo to GitHub.
2. Import it into [Vercel](https://vercel.com/new).
3. Add `DATABASE_URL` as an environment variable in the Vercel project
   settings, using the same Neon connection string from `.env.local`.
4. Deploy.

## Project structure

- `src/app/page.tsx` — Home (add/inline-edit/delete, date browsing)
- `src/app/dashboard/page.tsx` — spending breakdown, chart, sharing
- `src/app/calculator/page.tsx` — calculator utility
- `src/app/login/`, `src/app/register/` — local auth screens
- `src/app/shared/[id]/page.tsx` — public read-only summary page
- `src/app/api/expenses/` — REST API (GET/POST, PATCH/DELETE by id)
- `src/app/api/shares/` — create/look up a share link
- `src/lib/` — constants, category→icon/color maps, date helpers, auth
  (`auth.ts`, `authContext.tsx`), shared date state (`selectedDateContext.tsx`)
- `src/components/` — reusable UI (custom Select dropdown, Pill tag,
  top bar, bottom nav)
- `scripts/` — one-off DB setup/migration scripts

## Known limitations / next steps

- Weekly and Monthly dashboard tabs use mock data, not real date-range queries.
- Login is local-only (browser `localStorage`, no password hashing, no
  server-side auth) — it's enough to personalize the app and separate data
  per profile, not real account security. Profiles live in `localStorage`,
  so they don't follow you to a different browser or device.
- Expenses created before per-profile tagging existed have no owner and are
  visible to any signed-in profile on this deployment (see `user_id IS NULL`
  handling in the API routes).
- No backdating: new expenses are always timestamped "now," even if you're
  viewing a past date.
- Share links are live (recompute on every view), not frozen snapshots.
