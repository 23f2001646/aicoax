"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  User, UserPrefs,
  getSession, getUserPrefs, saveUserPrefs, logout as authLogout, defaultPrefs,
} from "@/lib/auth";

/* ── Background presets ──────────────────────────────────── */
export const BG_PRESETS: Record<string, { label: string; emoji: string; css: string }> = {
  default:  { label: "Dark",      emoji: "🌑", css: "#020617" },
  blush:    { label: "Blush",     emoji: "🌸", css: "linear-gradient(135deg,#2d0a18 0%,#1a0510 50%,#2a0d20 100%)" },
  aurora:   { label: "Aurora",    emoji: "🌌", css: "linear-gradient(135deg,#0d0221 0%,#0a1628 40%,#071a12 100%)" },
  lavender: { label: "Lavender",  emoji: "💜", css: "linear-gradient(135deg,#0e0520 0%,#150838 50%,#0a0418 100%)" },
  sunset:   { label: "Sunset",    emoji: "🌅", css: "linear-gradient(135deg,#1a0500 0%,#3a0e08 40%,#1a0818 100%)" },
  ocean:    { label: "Ocean",     emoji: "🌊", css: "linear-gradient(135deg,#030d1a 0%,#061828 50%,#020b18 100%)" },
  forest:   { label: "Forest",    emoji: "🌿", css: "linear-gradient(135deg,#020e06 0%,#071a0a 50%,#030e08 100%)" },
};

/* ── Context types ───────────────────────────────────────── */
export type Theme = "dark" | "light" | "blush";

interface AppCtx {
  user: User | null;
  prefs: UserPrefs;
  theme: Theme;
  bgCss: string;
  setTheme: (t: Theme) => void;
  setBg: (bg: string, customUrl?: string) => void;
  updatePrefs: (p: Partial<UserPrefs>) => void;
  logout: () => void;
  authReady: boolean;
}

const AppContext = createContext<AppCtx>({
  user: null, prefs: defaultPrefs(), theme: "dark", bgCss: "#020617",
  setTheme: () => {}, setBg: () => {}, updatePrefs: () => {}, logout: () => {}, authReady: false,
});

export function useApp() { return useContext(AppContext); }

/* ── Public pages that don't need auth ───────────────────── */
const PUBLIC = ["/login", "/onboarding"];

function applyTheme(t: Theme) {
  if (typeof document !== "undefined")
    document.documentElement.setAttribute("data-theme", t);
}

/* ── Provider ─────────────────────────────────────────────── */
export function AppProviders({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();

  // Always start with null/default (matches server render — no hydration mismatch)
  const [user, setUser]   = useState<User | null>(null);
  const [prefs, setPrefs] = useState<UserPrefs>(defaultPrefs());
  // Start ready=true so children render immediately — no blocking spinner
  const [ready, setReady] = useState(true);
  const didInit = useRef(false);

  const initAuth = useRef(() => {
    let session: User | null = null;
    let p = defaultPrefs();
    try { session = getSession(); } catch {}
    if (session) {
      try { p = getUserPrefs(session.id); } catch {}
      setUser(session);
      setPrefs(p);
      applyTheme(p.theme);
    } else {
      setUser(null);
      setPrefs(defaultPrefs());
    }
    setReady(true);
    return { session, p };
  });

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    const { session, p } = initAuth.current();

    // Small timeout ensures router is fully initialized before navigation
    setTimeout(() => {
      if (session) {
        if (!p.onboardingDone && pathname !== "/onboarding") {
          router.replace("/onboarding");
        }
      } else if (!PUBLIC.includes(pathname)) {
        router.replace("/login");
      }
    }, 0);

    // Re-check auth when tab becomes visible again (handles back/forward cache)
    const onVisible = () => {
      if (document.visibilityState === "visible") initAuth.current();
    };
    document.addEventListener("visibilitychange", onVisible);

    // Handle browser BFCache restore (back/forward navigation)
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) initAuth.current();
    };
    window.addEventListener("pageshow", onPageShow);

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("pageshow", onPageShow);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setTheme = useCallback((t: Theme) => {
    if (!user) return;
    applyTheme(t);
    const updated = saveUserPrefs(user.id, { theme: t });
    setPrefs(updated);
  }, [user]);

  const setBg = useCallback((bg: string, customUrl?: string) => {
    if (!user) return;
    const updated = saveUserPrefs(user.id, { background: bg, bgCustomUrl: customUrl });
    setPrefs(updated);
  }, [user]);

  const updatePrefs = useCallback((p: Partial<UserPrefs>) => {
    if (!user) return;
    const updated = saveUserPrefs(user.id, p);
    setPrefs(updated);
    if (p.theme) applyTheme(p.theme);
  }, [user]);

  const logout = useCallback(() => {
    authLogout();
    setUser(null);
    setPrefs(defaultPrefs());
    applyTheme("dark");
    router.replace("/login");
  }, [router]);

  const bgCss = prefs.background === "custom" && prefs.bgCustomUrl
    ? `url(${prefs.bgCustomUrl}) center/cover no-repeat`
    : (BG_PRESETS[prefs.background]?.css ?? BG_PRESETS.default.css);

  const value: AppCtx = { user, prefs, theme: prefs.theme, bgCss, setTheme, setBg, updatePrefs, logout, authReady: ready };

  return (
    <AppContext.Provider value={value}>
      <div style={{ position: "fixed", inset: 0, zIndex: -1, background: bgCss, transition: "background 0.6s ease" }} />
      {children}
    </AppContext.Provider>
  );
}
