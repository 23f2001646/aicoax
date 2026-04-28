"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp, BG_PRESETS, type Theme } from "@/components/AppProviders";

const TONES = [
  { value: "gentle",       label: "Gentle",       desc: "Soft & nurturing",   emoji: "🌸" },
  { value: "direct",       label: "Direct",        desc: "Clear & honest",     emoji: "🎯" },
  { value: "fun",          label: "Fun",           desc: "Playful & upbeat",   emoji: "✨" },
  { value: "motivational", label: "Motivational",  desc: "Hype & energy",      emoji: "🔥" },
] as const;

const THEMES: { value: Theme; label: string; emoji: string; preview: string }[] = [
  { value: "dark",   label: "Dark",        emoji: "🌑", preview: "linear-gradient(135deg,#020617,#0f172a)" },
  { value: "light",  label: "Sky",         emoji: "☀️", preview: "linear-gradient(135deg,#f5f7fa,#dde8f5)" },
  { value: "blush",  label: "Blush",       emoji: "🌸", preview: "linear-gradient(135deg,#1a0210,#280618)" },
  { value: "neon",   label: "Neon",        emoji: "⚡", preview: "linear-gradient(135deg,#020202,#0a0a0a)" },
  { value: "white",  label: "Rose White",  emoji: "🤍", preview: "linear-gradient(135deg,#fdf6f9,#fce8f0)" },
  { value: "violet", label: "Violet",      emoji: "💜", preview: "linear-gradient(135deg,#0a0118,#1c1038)" },
];

const NEON_ACCENTS: Record<string, string> = {
  neon: "#ff2d78", violet: "#a78bfa", blush: "#f472b6",
};

export default function ProfilePage() {
  const { user, prefs, updatePrefs, setTheme, setBg, logout } = useApp();
  const router = useRouter();
  const [customUrl, setCustomUrl] = useState(prefs.bgCustomUrl ?? "");
  const [saved, setSaved] = useState(false);

  if (!user) return null;

  function save(patch: Parameters<typeof updatePrefs>[0]) {
    updatePrefs(patch);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  const accentColor = NEON_ACCENTS[prefs.theme] ?? "#14b8a6";

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm px-4 sm:px-6 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => router.back()} className="text-slate-400 hover:text-white transition-colors p-1 text-xl">←</button>
        <h1 className="font-bold text-white flex-1">Settings & Profile</h1>
        {saved && (
          <span className="text-xs font-medium px-3 py-1 rounded-full bg-teal-500/20 text-teal-400 border border-teal-500/30">
            Saved ✓
          </span>
        )}
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* Two-column layout on desktop */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-8 space-y-5 lg:space-y-0">

          {/* ── LEFT COLUMN ── */}
          <div className="space-y-5">

            {/* User card */}
            <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 flex items-center gap-4">
              <div className="relative">
                <span className="text-5xl">{user.avatar}</span>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-teal-500 border-2 border-slate-900" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-lg truncate">{user.name}</p>
                <p className="text-slate-500 text-sm truncate">{user.email || "Guest account"}</p>
              </div>
            </div>

            {/* Maya personalisation */}
            <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-5">
              <p className="text-white font-semibold flex items-center gap-2">🧡 Personalise Maya</p>

              <div>
                <label className="text-slate-400 text-xs uppercase tracking-wider block mb-2">Maya calls me</label>
                <input
                  type="text"
                  placeholder={user.name.split(" ")[0]}
                  value={prefs.mayaCallsMe}
                  onChange={e => save({ mayaCallsMe: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-slate-400 text-xs uppercase tracking-wider block mb-3">Maya&apos;s tone</label>
                <div className="grid grid-cols-2 gap-2">
                  {TONES.map(t => (
                    <button key={t.value} onClick={() => save({ mayaTone: t.value })}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        prefs.mayaTone === t.value
                          ? "border-teal-500 bg-teal-500/10"
                          : "border-slate-700 bg-slate-800 hover:border-slate-600"
                      }`}>
                      <div className="text-xl mb-1">{t.emoji}</div>
                      <div className="text-sm font-medium text-white">{t.label}</div>
                      <div className="text-xs text-slate-500">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sign out */}
            <button onClick={logout}
              className="w-full py-3 rounded-xl border border-red-900 bg-red-950/30 text-red-400 hover:bg-red-900/40 transition-colors text-sm font-medium">
              Sign out
            </button>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="space-y-5">

            {/* Theme picker */}
            <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-4">
              <p className="text-white font-semibold flex items-center gap-2">🎨 Theme</p>
              <div className="grid grid-cols-3 gap-3">
                {THEMES.map(t => (
                  <button key={t.value}
                    onClick={() => { setTheme(t.value); save({ theme: t.value }); }}
                    className={`rounded-xl overflow-hidden border-2 transition-all ${
                      prefs.theme === t.value ? "border-teal-500 scale-[1.03]" : "border-slate-700 hover:border-slate-500"
                    }`}>
                    {/* Preview swatch */}
                    <div className="h-14 w-full" style={{ background: t.preview }}>
                      {t.value === "neon" && (
                        <div className="h-full w-full flex items-center justify-center">
                          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#ff2d78", boxShadow: "0 0 16px #ff2d78, 0 0 32px #ff2d7880" }} />
                        </div>
                      )}
                    </div>
                    <div className="bg-slate-800 px-2 py-2 flex items-center gap-1.5">
                      <span className="text-sm">{t.emoji}</span>
                      <span className="text-xs text-white font-medium truncate">{t.label}</span>
                      {prefs.theme === t.value && <span className="ml-auto text-teal-400 text-xs">✓</span>}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Background */}
            <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-4">
              <p className="text-white font-semibold flex items-center gap-2">🖼️ Background</p>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(BG_PRESETS).map(([key, bg]) => (
                  <button key={key}
                    onClick={() => { setBg(key); save({ background: key }); }}
                    className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${
                      prefs.background === key ? "border-teal-500 scale-105" : "border-slate-700 hover:border-slate-500"
                    }`}
                    style={{ background: bg.css }}>
                    <span className="text-base">{bg.emoji}</span>
                    <span className="text-white text-[10px] font-medium drop-shadow">{bg.label}</span>
                  </button>
                ))}
                <button
                  onClick={() => { setBg("custom", customUrl || undefined); save({ background: "custom", bgCustomUrl: customUrl }); }}
                  className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all bg-slate-800 ${
                    prefs.background === "custom" ? "border-teal-500 scale-105" : "border-slate-700 hover:border-slate-500"
                  }`}>
                  <span className="text-base">🖼️</span>
                  <span className="text-white text-[10px]">Custom</span>
                </button>
              </div>
              {(prefs.background === "custom" || customUrl) && (
                <input type="url" placeholder="https://… image URL"
                  value={customUrl}
                  onChange={e => setCustomUrl(e.target.value)}
                  onBlur={() => { setBg("custom", customUrl); save({ background: "custom", bgCustomUrl: customUrl }); }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-500 transition-colors"
                />
              )}
            </div>

            {/* Active theme info card */}
            <div className="rounded-xl p-4 border text-sm"
              style={{
                background: `${accentColor}12`,
                borderColor: `${accentColor}30`,
              }}>
              <p className="font-medium" style={{ color: accentColor }}>
                {THEMES.find(t => t.value === prefs.theme)?.emoji} {THEMES.find(t => t.value === prefs.theme)?.label} theme active
              </p>
              <p className="text-slate-400 text-xs mt-1">Theme applies across all pages instantly.</p>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
