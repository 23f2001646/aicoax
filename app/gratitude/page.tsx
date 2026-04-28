"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, Heart } from "lucide-react";
import { useApp } from "@/components/AppProviders";
import { uKey } from "@/lib/auth";

interface GratitudeEntry {
  date: string;
  items: string[];
  reflection?: string;
}

const PROMPTS = [
  "Something that made you smile today…",
  "A person who helped you recently…",
  "Something you usually take for granted…",
  "A small win you had today…",
  "Something beautiful you noticed…",
  "A strength you used today…",
];

function today() { return new Date().toISOString().slice(0, 10); }
function streak(entries: GratitudeEntry[]) {
  let s = 0;
  const d = new Date();
  while (true) {
    const ds = d.toISOString().slice(0, 10);
    if (entries.find(e => e.date === ds)) { s++; d.setDate(d.getDate() - 1); } else break;
  }
  return s;
}

export default function GratitudePage() {
  const { user } = useApp();
  const router = useRouter();
  const key = user ? uKey(user.id, "gratitude") : "aicoax_gratitude_guest";

  const [entries, setEntries]   = useState<GratitudeEntry[]>([]);
  const [items, setItems]       = useState(["", "", ""]);
  const [saved, setSaved]       = useState(false);
  const [reflection, setReflection] = useState("");
  const [loadingRef, setLoadingRef] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        setEntries(parsed);
        const tod = parsed.find((e: GratitudeEntry) => e.date === today());
        if (tod) { setItems(tod.items.concat(Array(3).fill("")).slice(0, 3)); setSaved(true); if (tod.reflection) setReflection(tod.reflection); }
      }
    } catch {}
  }, [key]);

  function saveEntry() {
    const filled = items.filter(i => i.trim());
    if (filled.length === 0) return;
    const entry: GratitudeEntry = { date: today(), items: filled };
    const updated = [...entries.filter(e => e.date !== today()), entry];
    localStorage.setItem(key, JSON.stringify(updated));
    setEntries(updated);
    setSaved(true);
  }

  async function getReflection() {
    const weekEntries = entries.slice(-7);
    if (weekEntries.length === 0) return;
    setLoadingRef(true);
    const allItems = weekEntries.flatMap(e => e.items).join(", ");
    const res = await fetch("/api/companion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{
          role: "user",
          content: `Here are the things someone has been grateful for over the past week: ${allItems}. Write a warm, 3-sentence reflection that highlights the themes you notice in what they appreciate. Be poetic and uplifting. No bullet points.`
        }]
      }),
    });
    if (res.body) {
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        setReflection(acc);
      }
      // Save reflection to today's entry
      const updated = entries.map(e => e.date === today() ? { ...e, reflection: acc } : e);
      localStorage.setItem(key, JSON.stringify(updated));
      setEntries(updated);
    }
    setLoadingRef(false);
  }

  const currentStreak = streak(entries);
  // Pick 3 random prompts once on mount (useRef so they don't change on every keystroke)
  const randomPromptsRef = useRef([...PROMPTS].sort(() => 0.5 - Math.random()).slice(0, 3));
  const randomPrompts = randomPromptsRef.current;

  return (
    <div className="min-h-screen bg-slate-950 pb-8">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm px-4 sm:px-6 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => router.back()} className="text-slate-400 hover:text-white p-1 transition-colors"><ArrowLeft className="w-5 h-5" /></button>
        <div className="flex-1">
          <h1 className="font-bold text-white">Gratitude Journal</h1>
          <p className="text-xs text-slate-500">3 things · Every day</p>
        </div>
        <div className="flex items-center gap-3">
          {currentStreak > 0 && (
            <div className="flex items-center gap-1 bg-orange-900/30 border border-orange-700/40 rounded-full px-3 py-1">
              <span className="text-sm">🔥</span>
              <span className="text-orange-300 text-xs font-semibold">{currentStreak}</span>
            </div>
          )}
          <button onClick={() => setShowHistory(v => !v)} className="text-slate-400 hover:text-white text-sm transition-colors">
            {showHistory ? "Today" : "History"}
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 sm:px-6 py-6 space-y-6">

        <AnimatePresence mode="wait">
          {!showHistory ? (
            <motion.div key="today" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">

              {/* Date header */}
              <div className="text-center">
                <p className="text-teal-400 text-xs uppercase tracking-wider">
                  {new Date().toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric" })}
                </p>
                <h2 className="text-white text-xl font-bold mt-1">What are you grateful for today?</h2>
              </div>

              {/* 3 inputs */}
              <div className="space-y-3">
                {items.map((item, i) => (
                  <div key={i} className="relative">
                    <div className="absolute left-4 top-3.5 text-slate-600 font-bold text-sm">{i + 1}.</div>
                    <input
                      value={item}
                      onChange={e => { const n = [...items]; n[i] = e.target.value; setItems(n); setSaved(false); }}
                      placeholder={randomPrompts[i]}
                      className="w-full bg-slate-900 border border-slate-700 focus:border-teal-500 rounded-2xl pl-9 pr-4 py-3.5 text-white placeholder-slate-600 text-sm focus:outline-none transition-colors"
                    />
                  </div>
                ))}
              </div>

              {!saved ? (
                <button onClick={saveEntry}
                  className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:opacity-90 text-white rounded-2xl py-3.5 font-semibold transition-opacity flex items-center justify-center gap-2">
                  <Heart className="w-4 h-4" /> Save Today&apos;s Gratitude
                </button>
              ) : (
                <div className="bg-teal-900/20 border border-teal-700/40 rounded-2xl p-4 text-center">
                  <p className="text-teal-300 text-sm font-medium">✓ Saved for today!</p>
                  {currentStreak > 0 && <p className="text-slate-400 text-xs mt-1">🔥 {currentStreak} day streak — keep it up!</p>}
                </div>
              )}

              {/* Weekly reflection */}
              {entries.length >= 3 && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400" /> Weekly Reflection
                    </p>
                    <button onClick={getReflection} disabled={loadingRef}
                      className="text-xs text-purple-400 hover:text-purple-300 border border-purple-700/50 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                      {loadingRef ? "Writing…" : "Generate"}
                    </button>
                  </div>
                  {reflection ? (
                    <p className="text-slate-300 text-sm leading-relaxed italic">&ldquo;{reflection}&rdquo;</p>
                  ) : (
                    <p className="text-slate-500 text-sm">After 3+ days of journaling, Maya reflects on the themes in your gratitude.</p>
                  )}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <p className="text-slate-400 text-sm uppercase tracking-wide">Past entries</p>
              {entries.length === 0 ? (
                <p className="text-slate-600 text-center py-8">No entries yet</p>
              ) : (
                [...entries].reverse().map((entry, i) => (
                  <motion.div key={entry.date} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
                    <p className="text-teal-400 text-xs font-medium">
                      {new Date(entry.date + "T12:00:00").toLocaleDateString("en", { weekday: "long", month: "short", day: "numeric" })}
                    </p>
                    {entry.items.map((item, j) => (
                      <p key={j} className="text-slate-300 text-sm flex gap-2">
                        <span className="text-slate-600">{j + 1}.</span> {item}
                      </p>
                    ))}
                    {entry.reflection && (
                      <p className="text-slate-500 text-xs italic mt-2 border-t border-slate-800 pt-2">&ldquo;{entry.reflection}&rdquo;</p>
                    )}
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
