import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { exchangeCodeForIdentity } from "@/lib/googleAuth";
import { createSession } from "@/lib/session";

const STATE_COOKIE = "khata_oauth_state";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const returnedState = searchParams.get("state");
  const expectedState = request.cookies.get(STATE_COOKIE)?.value;

  const clearStateCookie = (response: NextResponse) => {
    response.cookies.delete(STATE_COOKIE);
    return response;
  };

  if (!code || !returnedState || !expectedState || returnedState !== expectedState) {
    return clearStateCookie(NextResponse.redirect(`${origin}/welcome`));
  }

  let identity;
  try {
    identity = await exchangeCodeForIdentity(origin, code);
  } catch {
    return clearStateCookie(NextResponse.redirect(`${origin}/welcome`));
  }

  const { rows: existingRows } = await pool.query(
    `SELECT id FROM profiles WHERE google_sub = $1`,
    [identity.sub]
  );

  if (existingRows.length > 0) {
    await createSession(existingRows[0].id);
    return clearStateCookie(NextResponse.redirect(`${origin}/`));
  }

  const { rows: nameCollisionRows } = await pool.query(
    `SELECT id FROM profiles WHERE lower(name) = lower($1)`,
    [identity.name]
  );
  if (nameCollisionRows.length > 0) {
    const url = new URL("/register", origin);
    url.searchParams.set("googleError", "duplicate");
    url.searchParams.set("name", identity.name);
    return clearStateCookie(NextResponse.redirect(url));
  }

  const { rows: insertedRows } = await pool.query(
    `INSERT INTO profiles (id, name, email, google_sub) VALUES ($1, $2, $3, $4) RETURNING id`,
    [crypto.randomUUID(), identity.name, identity.email, identity.sub]
  );
  await createSession(insertedRows[0].id);
  return clearStateCookie(NextResponse.redirect(`${origin}/`));
}
