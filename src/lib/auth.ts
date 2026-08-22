// Local-only mock auth: no backend, no password hashing, no real security.
// Just enough to personalize the greeting and tag expenses with a stable
// per-profile id so data stays separated between profiles on this device.
// Supports multiple profiles per device — each with its own id, so its
// expenses/budget/share link stay scoped to that profile only.

export type Profile = {
  id: string;
  name: string;
  email?: string;
  password?: string;
};

const PROFILES_KEY = "khata_profiles";
const ACTIVE_KEY = "khata_active_profile";
const LAST_ACTIVE_KEY = "khata_last_active_profile";

// Pre-multi-profile storage shape — migrated once, then removed.
const LEGACY_PROFILE_KEY = "khata_profile";
const LEGACY_SESSION_KEY = "khata_session";

function migrateLegacyProfile() {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(PROFILES_KEY)) return;

  const legacyRaw = localStorage.getItem(LEGACY_PROFILE_KEY);
  if (!legacyRaw) return;

  try {
    const legacyProfile = JSON.parse(legacyRaw) as Profile;
    localStorage.setItem(PROFILES_KEY, JSON.stringify([legacyProfile]));
    if (localStorage.getItem(LEGACY_SESSION_KEY) === "active") {
      localStorage.setItem(ACTIVE_KEY, legacyProfile.id);
      localStorage.setItem(LAST_ACTIVE_KEY, legacyProfile.id);
    }
  } catch {
    // malformed legacy data — nothing to migrate
  } finally {
    localStorage.removeItem(LEGACY_PROFILE_KEY);
    localStorage.removeItem(LEGACY_SESSION_KEY);
  }
}

function readProfiles(): Profile[] {
  if (typeof window === "undefined") return [];
  migrateLegacyProfile();
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    return raw ? (JSON.parse(raw) as Profile[]) : [];
  } catch {
    return [];
  }
}

function writeProfiles(profiles: Profile[]) {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

function setActive(id: string) {
  localStorage.setItem(ACTIVE_KEY, id);
  localStorage.setItem(LAST_ACTIVE_KEY, id);
}

export function getProfiles(): Profile[] {
  return readProfiles();
}

export function getProfile(): Profile | null {
  if (typeof window === "undefined") return null;
  const id = localStorage.getItem(ACTIVE_KEY);
  if (!id) return null;
  return readProfiles().find((p) => p.id === id) ?? null;
}

// The profile that was active before the most recent logout, if any —
// lets the login screen skip straight back to "your" form instead of
// always showing the picker.
export function getLastActiveProfile(): Profile | null {
  if (typeof window === "undefined") return null;
  const id = localStorage.getItem(LAST_ACTIVE_KEY);
  if (!id) return null;
  return readProfiles().find((p) => p.id === id) ?? null;
}

export function hasActiveSession(): boolean {
  return getProfile() !== null;
}

export function register(input: { name: string; email?: string; password?: string }): Profile {
  const profile: Profile = { id: crypto.randomUUID(), ...input };
  const profiles = readProfiles();
  profiles.push(profile);
  writeProfiles(profiles);
  setActive(profile.id);
  return profile;
}

export function login(profileId: string, name: string, password: string): boolean {
  const profile = readProfiles().find((p) => p.id === profileId);
  if (!profile) return false;
  const nameMatches = profile.name.trim().toLowerCase() === name.trim().toLowerCase();
  const passwordMatches = !profile.password || profile.password === password;
  if (!nameMatches || !passwordMatches) return false;
  setActive(profile.id);
  return true;
}

export function logout() {
  localStorage.removeItem(ACTIVE_KEY);
}
