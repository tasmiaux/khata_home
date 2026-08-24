import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SESSION_COOKIE = "khata_session";
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

const secretKey = process.env.SESSION_SECRET;
if (!secretKey) throw new Error("SESSION_SECRET is not set");
const encodedKey = new TextEncoder().encode(secretKey);

type SessionPayload = {
  profileId: string;
};

async function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_MS / 1000}s`)
    .sign(encodedKey);
}

async function decrypt(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, encodedKey, { algorithms: ["HS256"] });
    if (typeof payload.profileId !== "string") return null;
    return { profileId: payload.profileId };
  } catch {
    return null;
  }
}

export async function createSession(profileId: string): Promise<void> {
  const token = await encrypt({ profileId });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(Date.now() + SESSION_DURATION_MS),
    path: "/",
  });
}

export async function getSessionProfileId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await decrypt(token);
  return session?.profileId ?? null;
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
