export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string; // emoji
}

export interface UserPrefs {
  mayaCallsMe: string;
  mayaTone: "gentle" | "direct" | "fun" | "motivational";
  lang: string;
  theme: "dark" | "light" | "blush" | "neon" | "white" | "violet";
  background: string;
  bgCustomUrl?: string;
  // onboarding
  onboardingDone: boolean;
  onboardingReason: string;   // "anxiety" | "burnout" | "grief" | "stress" | "loneliness" | "growth" | "other"
  onboardingMood: number;     // 1-5 initial mood
  notifyTime?: string;        // "08:00" HH:MM preferred daily reminder
}

export const DEMO_ACCOUNTS = [
  { id: "u1", name: "Arjun Sharma",  email: "arjun@demo.com",  password: "demo123", avatar: "👨‍💻", bio: "Software engineer, stressed about deadlines" },
  { id: "u2", name: "Priya Patel",   email: "priya@demo.com",  password: "demo123", avatar: "👩‍🎨", bio: "Design student, navigating anxiety" },
  { id: "u3", name: "Sam Chen",      email: "sam@demo.com",    password: "demo123", avatar: "🧑‍🎓", bio: "Preparing for campus placements" },
] as const;

const SESSION_KEY = "aicoax_session";

export function loginWithDemo(id: string): User | null {
  const acc = DEMO_ACCOUNTS.find(a => a.id === id);
  if (!acc) return null;
  const user: User = { id: acc.id, name: acc.name, email: acc.email, avatar: acc.avatar };
  if (typeof window !== "undefined") localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return user;
}

export function loginWithCredentials(email: string, password: string): User | null {
  const acc = DEMO_ACCOUNTS.find(a => a.email === email && a.password === password);
  if (!acc) return null;
  const user: User = { id: acc.id, name: acc.name, email: acc.email, avatar: acc.avatar };
  if (typeof window !== "undefined") localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return user;
}

export function loginAsGuest(): User {
  const user: User = { id: "guest", name: "Friend", email: "", avatar: "✨" };
  if (typeof window !== "undefined") localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return user;
}

export function logout() {
  if (typeof window !== "undefined") localStorage.removeItem(SESSION_KEY);
}

export function getSession(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const s = localStorage.getItem(SESSION_KEY);
    return s ? JSON.parse(s) : null;
  } catch { return null; }
}

export function defaultPrefs(): UserPrefs {
  return { mayaCallsMe: "", mayaTone: "gentle", lang: "en", theme: "white", background: "default", onboardingDone: false, onboardingReason: "", onboardingMood: 3 };
}

export function getUserPrefs(userId: string): UserPrefs {
  if (typeof window === "undefined") return defaultPrefs();
  try {
    const s = localStorage.getItem(`aicoax_prefs_${userId}`);
    return s ? { ...defaultPrefs(), ...JSON.parse(s) } : defaultPrefs();
  } catch { return defaultPrefs(); }
}

export function saveUserPrefs(userId: string, prefs: Partial<UserPrefs>) {
  const current = getUserPrefs(userId);
  const merged = { ...current, ...prefs };
  localStorage.setItem(`aicoax_prefs_${userId}`, JSON.stringify(merged));
  return merged;
}

// Per-user storage key
export function uKey(userId: string, base: string) {
  return `aicoax_${base}_${userId}`;
}
