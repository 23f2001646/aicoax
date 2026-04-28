"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp, BG_PRESETS, type Theme } from "@/components/AppProviders";

const TONES = [
  { value: "gentle",       label: "Gentle",       desc: "Soft and nurturing",     emoji: "🌸" },
  { value: "direct",       label: "Direct",        desc: "Clear and honest",       emoji: "🎯" },
  { value: "fun",          label: "Fun",           desc: "Playful and upbeat",     emoji: "✨" },
  { value: "motivational", label: "Motivational",  desc: "Energetic and inspiring",emoji: "🔥" },
] as const;

const THEMES: { value: Theme; label: string; emoji: string }[] = [
  { value: "dark",  label: "Dark",  emoji: "🌑" },
  { value: "light", label: "Light", emoji: "☀️" },
  { value: "blush", label: "Blush", emoji: "🌸" },
];

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

  return (
    <div className="min-h-screen bg-slate-950 px-4 sm:px-6 py-6 sm:py-8">
      <div className="max-w-lg mx-auto space-y-5 sm:space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-slate-400 hover:text-white transition-colors text-xl">←</button>
          <h1 className="text-xl font-semibold text-white flex-1">Settings</h1>
          {saved && <span className="text-teal-400 text-sm">Saved ✓</span>}
        </div>

        {/* User card */}
        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 flex items-center gap-4">
          <span className="text-4xl">{user.avatar}</span>
          <div>
            <p className="text-white font-medium">{user.name}</p>
            <p className="text-slate-500 text-sm">{user.email || "Guest"}</p>
          </div>
        </div>

        {/* Maya personalisation */}
        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-4">
          <p className="text-white font-medium">Personalise Maya</p>
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
            <label className="text-slate-400 text-xs uppercase tracking-wider block mb-2">Maya&apos;s tone</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {TONES.map(t => (
                <button
                  key={t.value}
                  onClick={() => save({ mayaTone: t.value })}
                  className={`p-3 rounded-xl border text-left transition-colors ${
                    prefs.mayaTone === t.value
                      ? "border-teal-500 bg-teal-500/10 text-white"
                      : "border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600"
                  }`}
                >
                  <div className="text-lg">{t.emoji}</div>
                  <div className="text-sm font-medium mt-1">{t.label}</div>
                  <div className="text-xs text-slate-500">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Theme */}
        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-4">
          <p className="text-white font-medium">Theme</p>
          <div className="flex gap-3">
            {THEMES.map(t => (
              <button
                key={t.value}
                onClick={() => { setTheme(t.value); save({ theme: t.value }); }}
                className={`flex-1 py-3 rounded-xl border text-sm transition-colors ${
                  prefs.theme === t.value
                    ? "border-teal-500 bg-teal-500/10 text-white"
                    : "border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600"
                }`}
              >
                <div className="text-xl mb-1">{t.emoji}</div>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Background */}
        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-4">
          <p className="text-white font-medium">Background</p>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(BG_PRESETS).map(([key, bg]) => (
              <button
                key={key}
                onClick={() => { setBg(key); save({ background: key }); }}
                className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-colors ${
                  prefs.background === key ? "border-teal-500" : "border-slate-700 hover:border-slate-500"
                }`}
                style={{ background: bg.css }}
              >
                <span className="text-lg">{bg.emoji}</span>
                <span className="text-white text-xs drop-shadow">{bg.label}</span>
              </button>
            ))}
            {/* Custom */}
            <button
              onClick={() => { setBg("custom", customUrl || undefined); save({ background: "custom", bgCustomUrl: customUrl }); }}
              className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-colors bg-slate-800 ${
                prefs.background === "custom" ? "border-teal-500" : "border-slate-700 hover:border-slate-500"
              }`}
            >
              <span className="text-lg">🖼️</span>
              <span className="text-white text-xs">Custom</span>
            </button>
          </div>
          {(prefs.background === "custom" || customUrl) && (
            <input
              type="url"
              placeholder="https://... image URL"
              value={customUrl}
              onChange={e => setCustomUrl(e.target.value)}
              onBlur={() => { setBg("custom", customUrl); save({ background: "custom", bgCustomUrl: customUrl }); }}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-500 transition-colors"
            />
          )}
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="w-full py-3 rounded-xl border border-red-900 bg-red-950/30 text-red-400 hover:bg-red-900/40 transition-colors text-sm"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
