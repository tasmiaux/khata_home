import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getGoogleAuthUrl } from "@/lib/googleAuth";

const STATE_COOKIE = "khata_oauth_state";

export async function GET(request: NextRequest) {
  const state = randomBytes(16).toString("hex");
  const response = NextResponse.redirect(getGoogleAuthUrl(request.nextUrl.origin, state));
  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return response;
}
