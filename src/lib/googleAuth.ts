import "server-only";
import { createRemoteJWKSet, jwtVerify } from "jose";

const GOOGLE_JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/oauth2/v3/certs")
);

// Read lazily (inside functions, not at module load) so a missing env var
// only breaks auth requests, not the entire build — Next.js evaluates
// every route module during "Collecting page data" at build time.
function getGoogleCredentials(): { clientId: string; clientSecret: string } {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET are not set");
  }
  return { clientId, clientSecret };
}

// Matches the redirect URI registered in Google Cloud Console.
function redirectUri(origin: string): string {
  return `${origin}/api/auth/callback/google`;
}

export function getGoogleAuthUrl(origin: string, state: string): string {
  const { clientId } = getGoogleCredentials();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri(origin),
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

type GoogleIdentity = {
  sub: string;
  email: string;
  name: string;
};

export async function exchangeCodeForIdentity(
  origin: string,
  code: string
): Promise<GoogleIdentity> {
  const { clientId, clientSecret } = getGoogleCredentials();
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri(origin),
      grant_type: "authorization_code",
    }),
  });

  if (!res.ok) {
    throw new Error(`Google token exchange failed: ${res.status} ${await res.text()}`);
  }

  const { id_token } = (await res.json()) as { id_token?: string };
  if (!id_token) throw new Error("Google token response had no id_token");

  const { payload } = await jwtVerify(id_token, GOOGLE_JWKS, {
    issuer: ["https://accounts.google.com", "accounts.google.com"],
    audience: clientId,
  });

  const { sub, email, name } = payload as { sub?: string; email?: string; name?: string };
  if (!sub || !email || !name) {
    throw new Error("Google ID token missing sub/email/name");
  }
  return { sub, email, name };
}
