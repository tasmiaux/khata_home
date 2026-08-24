// Local-only auth: no backend, no server session. Profiles live in
// localStorage, each tagged with a stable id used to scope that profile's
// expenses/shares server-side. The PIN is hashed (SHA-256 + per-profile
// salt) before it's ever written to localStorage — this isn't meant to
// resist an attacker with access to the device's storage, just to avoid
// keeping the PIN itself in the clear.

export type Profile = {
  id: string;
  name: string;
  pinHash: string;
  pinSalt: string;
};

const PROFILES_KEY = "khata_profiles";
const ACTIVE_KEY = "khata_active_profile";
const LAST_ACTIVE_KEY = "khata_last_active_profile";

function readProfiles(): Profile[] {
  if (typeof window === "undefined") return [];
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

export async function hashPin(pin: string, salt: string): Promise<string> {
  const bytes = new TextEncoder().encode(`${salt}:${pin}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function isValidPin(pin: string): boolean {
  return /^\d{4}$/.test(pin);
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

export async function register(input: { name: string; pin: string }): Promise<Profile> {
  const name = input.name.trim();
  const profiles = readProfiles();
  const duplicate = profiles.some((p) => p.name.trim().toLowerCase() === name.toLowerCase());
  if (duplicate) {
    throw new Error(
      `A profile named '${name}' already exists on this device. Log in instead, or pick a different name.`
    );
  }

  const pinSalt = crypto.randomUUID();
  const pinHash = await hashPin(input.pin, pinSalt);
  const profile: Profile = { id: crypto.randomUUID(), name, pinHash, pinSalt };
  profiles.push(profile);
  writeProfiles(profiles);
  setActive(profile.id);
  return profile;
}

export async function login(profileId: string, name: string, pin: string): Promise<boolean> {
  const profile = readProfiles().find((p) => p.id === profileId);
  if (!profile) return false;
  const nameMatches = profile.name.trim().toLowerCase() === name.trim().toLowerCase();
  const pinMatches = (await hashPin(pin, profile.pinSalt)) === profile.pinHash;
  if (!nameMatches || !pinMatches) return false;
  setActive(profile.id);
  return true;
}

export function logout() {
  localStorage.removeItem(ACTIVE_KEY);
}

// Forgets every profile on this device — the local equivalent of signing
// everyone out and wiping the profile picker. Server-side data for those
// profile ids is untouched (just no longer reachable from this device).
export function resetDevice() {
  localStorage.removeItem(PROFILES_KEY);
  localStorage.removeItem(ACTIVE_KEY);
  localStorage.removeItem(LAST_ACTIVE_KEY);
}

// One-time cleanup for profiles that predate the duplicate-name guard in
// register(): collapses profiles sharing a name (case-insensitive) down to
// the earliest one (first in storage order = first created), and wipes the
// removed duplicates' server-side expenses/shares. If the active or
// last-active session pointed at a removed duplicate, it's re-pointed at
// the surviving profile with that name so no session is left dangling.
export async function dedupeProfiles(): Promise<void> {
  if (typeof window === "undefined") return;

  const profiles = readProfiles();
  const kept = new Map<string, Profile>();
  const removed: Profile[] = [];
  for (const p of profiles) {
    const key = p.name.trim().toLowerCase();
    if (kept.has(key)) {
      removed.push(p);
    } else {
      kept.set(key, p);
    }
  }
  if (removed.length === 0) return;

  writeProfiles(Array.from(kept.values()));

  const removedIds = new Set(removed.map((p) => p.id));
  const repoint = (key: string) => {
    const id = localStorage.getItem(key);
    if (!id || !removedIds.has(id)) return;
    const removedProfile = removed.find((p) => p.id === id);
    const replacement = removedProfile && kept.get(removedProfile.name.trim().toLowerCase());
    if (replacement) {
      localStorage.setItem(key, replacement.id);
    } else {
      localStorage.removeItem(key);
    }
  };
  repoint(ACTIVE_KEY);
  repoint(LAST_ACTIVE_KEY);

  await Promise.allSettled(
    removed.map((p) => fetch(`/api/profiles/${p.id}`, { method: "DELETE" }))
  );
}
