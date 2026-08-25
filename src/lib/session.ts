import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

const SESSION_COOKIE = "khata_session";
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// Read lazily (inside functions, not at module load) so a missing env var
// only breaks auth requests, not the entire build — Next.js evaluates
// every route module during "Collecting page data" at build time.
function getEncodedKey(): Uint8Array {
  const secretKey = process.env.SESSION_SECRET;
  if (!secretKey) throw new Error("SESSION_SECRET is not set");
  return new TextEncoder().encode(secretKey);
}

type SessionPayload = {
  profileId: string;
};

async function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_MS / 1000}s`)
    .sign(getEncodedKey());
}

async function decrypt(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getEncodedKey(), { algorithms: ["HS256"] });
    if (typeof payload.profileId !== "string") return null;
    return { profileId: payload.profileId };
  } catch {
    return null;
  }
}

// Sets the session cookie directly on the response being returned. This
// is deliberately not next/headers' cookies().set() — that mutates a
// separate internal response and isn't guaranteed to merge into a
// manually-constructed NextResponse (e.g. NextResponse.redirect())
// returned from a Route Handler, which caused the cookie to silently
// never reach the browser after a successful Google sign-in.
export async function attachSession(response: NextResponse, profileId: string): Promise<void> {
  const token = await encrypt({ profileId });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(Date.now() + SESSION_DURATION_MS),
    path: "/",
  });
}

export function clearSession(response: NextResponse): void {
  response.cookies.delete(SESSION_COOKIE);
}

// Reading (not writing) via next/headers' cookies() is fine — there's no
// response-merging ambiguity for a read.
export async function getSessionProfileId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await decrypt(token);
  return session?.profileId ?? null;
}
