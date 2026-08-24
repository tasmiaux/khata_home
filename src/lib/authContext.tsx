"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getProfile, getProfiles, hasActiveSession, type Profile } from "./auth";

type AuthState = {
  profile: Profile | null;
  isAuthenticated: boolean;
  ready: boolean;
  refresh: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

// Redirect away from these if already authenticated (no reason to see the
// login/register form while signed in).
const AUTH_ONLY_PATHS = ["/login", "/register"];

// Always accessible, regardless of auth state — never redirected either way.
// Shared summary links must work for viewers with no Khata account at all.
const PUBLIC_PREFIXES = ["/shared/"];

// The "switch profile" flow needs to reach the login picker while already
// authenticated (so it can log in as someone else) — exempt it from both
// redirect rules below.
const NO_REDIRECT_PATHS = ["/login/switch"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const refresh = useCallback(() => {
    const p = getProfile();
    setProfile(p);
    setIsAuthenticated(hasActiveSession() && !!p);
  }, []);

  useEffect(() => {
    refresh();
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return;
    if (NO_REDIRECT_PATHS.includes(pathname)) return;

    const isAuthPage = AUTH_ONLY_PATHS.includes(pathname);
    if (!isAuthenticated && !isAuthPage) {
      router.replace(getProfiles().length > 0 ? "/login" : "/register");
    } else if (isAuthenticated && isAuthPage) {
      router.replace("/");
    }
  }, [ready, isAuthenticated, pathname, router]);

  return (
    <AuthContext.Provider value={{ profile, isAuthenticated, ready, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
