# Khata — a home expense ledger

Khata (खाता, "ledger" in Hindi/Urdu) is a single-page expense tracker built
for manual, no-bank-linking home budgeting. Add an expense in a few taps,
see your running total instantly, and browse any past day — styled like a
digitized ledger book.

## Features

- **Quick expense entry** — amount, category (18 household-specific options,
  grouped by home / food / lifestyle / health & education), payment mode
  (Cash / UPI / Card), and an optional note.
- **Inline edit & delete** — tap an entry to edit it right there in the list,
  including its date. Deleting shows an "Undo" toast for 5 seconds before
  it's actually removed.
- **Recurring expenses** — flag an expense "Repeat this monthly" (e.g. rent,
  college fee) and it resurfaces as a one-tap quick-add suggestion once
  logged for a new month.
- **Date browser** — a calendar picker on Home lets you view any previous
  day's spending. The Dashboard's tabs follow the same selected date, so
  they all stay in sync. The Add Expense form shows its target date as a
  tappable chip (e.g. "Tue, 20 Aug") at any point during entry — changing it
  doesn't clear the amount/category/note already filled in, and the
  expense saves under that date instead of "now."
- **Dashboard** — category-wise breakdown with a donut chart for Today,
  Weekly (Mon–Sun), and Monthly, all backed by real per-profile queries.
  Also shows a live month-over-month comparison line for the top spending
  category.
- **Share with Family** — pick a period (Today / Weekly / Monthly) and
  generate a read-only summary link (spent total + category breakdown for
  that period) from the Dashboard. Viewers don't need a Khata account to
  open it. Links are live — they always reflect current data, not a
  snapshot from when they were generated.
- **Calculator** — a built-in quick-math tool for on-the-fly totals.
- **Sign in with Google** — one account, one profile, works from any
  device. A real server-side session (signed, httpOnly cookie) backs it —
  see `src/lib/session.ts` and `src/app/api/auth/`. First-time and
  logged-out visitors land on a Welcome screen ("Create your khata" /
  "Log in") before reaching Register or Login, both of which are just a
  single "Continue with Google" button; anyone with an active session
  skips straight to Home. The Accounts screen (tap your name in the top
  bar) shows your name/email and lets you log out.

## Tech stack

- Next.js (App Router) + TypeScript
- Tailwind CSS v4
- Postgres via [Neon](https://neon.tech), accessed with `pg`
- Google OAuth (Sign in with Google) + `jose` for signed session cookies
- Lucide icons

## Getting started

1. Create a free Postgres database at neon.tech and copy the connection string.
2. Create a Google OAuth Client ID (free, no billing) at
   [console.cloud.google.com](https://console.cloud.google.com) →
   *APIs & Services* → *Credentials* → *Create Credentials* → *OAuth client
   ID* → Web application. Add `http://localhost:8080` as an authorized
   JavaScript origin and `http://localhost:8080/api/auth/callback/google`
   as an authorized redirect URI (add the production equivalents once you
   know your deployed domain).
3. Add all of this to `.env.local`:
   ```
   DATABASE_URL=postgresql://...
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   SESSION_SECRET=...   # generate with: openssl rand -base64 32
   ```
4. Install dependencies and set up the schema:
   ```bash
   npm install
   node scripts/init-db.mjs
   node scripts/migrate-ledger.mjs
   node scripts/migrate-user-auth.mjs
   node scripts/migrate-shares.mjs
   node scripts/migrate-recurring.mjs
   node scripts/migrate-scope-expenses.mjs
   node scripts/migrate-share-period.mjs
   node scripts/migrate-google-auth.mjs
   ```
   `migrate-scope-expenses.mjs` deletes any expense rows with no owner
   (pre-auth data) — run it only once you're sure nothing needs recovering
   from that state.
5. Run the dev server:
   ```bash
   npm run dev
   ```
   Runs on `http://localhost:8080` (see `package.json`'s `dev` script).
6. Open the app and sign in with Google — that's the only "setup" needed
   to start adding expenses.

## Deploying

1. Push this repo to GitHub.
2. Import it into [Vercel](https://vercel.com/new).
3. Add `DATABASE_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and
   `SESSION_SECRET` as environment variables in the Vercel project
   settings.
4. Add your deployed domain as an authorized JavaScript origin and
   `https://<your-domain>/api/auth/callback/google` as an authorized
   redirect URI in the Google Cloud Console credential from setup.
5. Deploy.

## Project structure

- `src/app/page.tsx` — Home (add/inline-edit/delete, date browsing)
- `src/app/dashboard/page.tsx` — spending breakdown, chart, sharing
- `src/app/calculator/page.tsx` — calculator utility
- `src/app/welcome/page.tsx` — entry point for logged-out visitors
- `src/app/register/` — single entry point into the Google OAuth flow
  (shows the duplicate-name error, if any); Welcome's "Log in" button
  points at the same `/api/auth/google` route
- `src/app/accounts/page.tsx` — current profile (name/email), logout
- `src/app/shared/[id]/page.tsx` — public read-only summary page
- `src/app/api/auth/google/` — starts the OAuth flow (redirects to Google)
- `src/app/api/auth/callback/google/` — OAuth callback: verifies the ID
  token, finds or creates the `profiles` row, starts the session
- `src/app/api/auth/session/`, `src/app/api/auth/logout/` — session
  read/clear, used by `authContext.tsx`
- `src/app/api/expenses/` — REST API (GET/POST, PATCH/DELETE by id)
- `src/app/api/shares/` — create/look up a share link
- `src/lib/session.ts` — signed httpOnly session cookie (`jose`)
- `src/lib/googleAuth.ts` — Google OAuth code exchange + ID token
  verification
- `src/lib/` (rest) — constants, category→icon/color maps, date helpers,
  auth client wrapper (`auth.ts`, `authContext.tsx`), shared date state
  (`selectedDateContext.tsx`)
- `src/components/` — reusable UI (custom Select dropdown, Pill tag,
  top bar, bottom nav)
- `scripts/` — one-off DB setup/migration scripts

## Known limitations / next steps

- Share links are live (recompute on every view), not frozen snapshots.
- One Google account per profile — no way to link a second sign-in method
  to the same profile.
