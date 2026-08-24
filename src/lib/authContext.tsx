"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getSession, type Profile } from "./auth";

type AuthState = {
  profile: Profile | null;
  isAuthenticated: boolean;
  ready: boolean;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

// Redirect away from these if already authenticated (no reason to see the
// welcome/login/register screens while signed in).
const AUTH_ONLY_PATHS = ["/welcome", "/login", "/register"];

// Always accessible, regardless of auth state — never redirected either way.
// Shared summary links must work for viewers with no Khata account at all.
const PUBLIC_PREFIXES = ["/shared/"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = !!profile;

  const refresh = useCallback(async () => {
    const p = await getSession();
    setProfile(p);
  }, []);

  useEffect(() => {
    refresh().finally(() => setReady(true));
  }, [refresh]);

  useEffect(() => {
    if (!ready) return;
    if (PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return;

    const isAuthPage = AUTH_ONLY_PATHS.includes(pathname);
    if (!isAuthenticated && !isAuthPage) {
      router.replace("/welcome");
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
