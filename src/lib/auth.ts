// Auth is Google-only, backed by a real server-side session (httpOnly
// cookie, see lib/session.ts) — this module is just the client-side
// wrapper around that session API. There is no local/PIN auth anymore.

export type Profile = {
  id: string;
  name: string;
  email: string;
};

export async function getSession(): Promise<Profile | null> {
  const res = await fetch("/api/auth/session", { cache: "no-store" });
  const data = await res.json();
  return data.profile ?? null;
}

export async function logout(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" });
}
