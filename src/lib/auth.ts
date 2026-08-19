// Local-only mock auth: no backend, no password hashing, no real security.
// Just enough to personalize the greeting and tag expenses with a stable
// per-profile id so data stays separated between profiles on this device.

export type Profile = {
  id: string;
  name: string;
  email?: string;
  password?: string;
};

const PROFILE_KEY = "khata_profile";
const SESSION_KEY = "khata_session";

export function getProfile(): Profile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as Profile) : null;
  } catch {
    return null;
  }
}

export function hasActiveSession(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(SESSION_KEY) === "active";
}

export function register(input: { name: string; email?: string; password?: string }): Profile {
  const profile: Profile = { id: crypto.randomUUID(), ...input };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  localStorage.setItem(SESSION_KEY, "active");
  return profile;
}

export function login(name: string, password: string): boolean {
  const profile = getProfile();
  if (!profile) return false;
  const nameMatches = profile.name.trim().toLowerCase() === name.trim().toLowerCase();
  const passwordMatches = !profile.password || profile.password === password;
  if (!nameMatches || !passwordMatches) return false;
  localStorage.setItem(SESSION_KEY, "active");
  return true;
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

export function resetProfile() {
  localStorage.removeItem(PROFILE_KEY);
  localStorage.removeItem(SESSION_KEY);
}
