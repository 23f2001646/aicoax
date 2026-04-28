"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Trash2, Check, TrendingUp } from "lucide-react";
import { useApp } from "@/components/AppProviders";
import { uKey } from "@/lib/auth";

interface Habit {
  id: string;
  name: string;
  emoji: string;
  color: string;
  createdAt: string;
}
interface HabitLog { habitId: string; date: string; }

const COLORS = ["from-teal-600 to-cyan-600","from-pink-600 to-rose-600","from-violet-600 to-purple-600",
  "from-amber-600 to-orange-600","from-green-600 to-emerald-600","from-blue-600 to-indigo-600"];
const EMOJIS = ["💪","🏃","📚","💧","🧘","😴","🥗","🎨","🎵","🌿","✍️","🧠"];

function today() { return new Date().toISOString().slice(0, 10); }
function last7() {
  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
}
function streak(habitId: string, logs: HabitLog[]) {
  let s = 0;
  const d = new Date();
  while (true) {
    const dateStr = d.toISOString().slice(0, 10);
    if (logs.find(l => l.habitId === habitId && l.date === dateStr)) {
      s++; d.setDate(d.getDate() - 1);
    } else break;
  }
  return s;
}

export default function HabitsPage() {
  const { user } = useApp();
  const router = useRouter();
  const habitsKey = user ? uKey(user.id, "habits") : "aicoax_habits_guest";
  const logsKey   = user ? uKey(user.id, "habit_logs") : "aicoax_habit_logs_guest";

  const [habits, setHabits]   = useState<Habit[]>([]);
  const [logs, setLogs]       = useState<HabitLog[]>([]);
  const [adding, setAdding]   = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmoji, setNewEmoji] = useState("💪");
  const [newColor, setNewColor] = useState(COLORS[0]);
  const [insight, setInsight] = useState("");
  const [loadingInsight, setLoadingInsight] = useState(false);

  useEffect(() => {
    try {
      setHabits(JSON.parse(localStorage.getItem(habitsKey) || "[]"));
      setLogs(JSON.parse(localStorage.getItem(logsKey) || "[]"));
    } catch {}
  }, [habitsKey, logsKey]);

  function save(h: Habit[], l: HabitLog[]) {
    setHabits(h); setLogs(l);
    localStorage.setItem(habitsKey, JSON.stringify(h));
    localStorage.setItem(logsKey, JSON.stringify(l));
  }

  function addHabit() {
    if (!newName.trim()) return;
    const h: Habit = { id: Date.now().toString(), name: newName.trim(), emoji: newEmoji, color: newColor, createdAt: today() };
    save([...habits, h], logs);
    setNewName(""); setAdding(false);
  }

  function toggleLog(habitId: string) {
    const t = today();
    const exists = logs.find(l => l.habitId === habitId && l.date === t);
    const newLogs = exists
      ? logs.filter(l => !(l.habitId === habitId && l.date === t))
      : [...logs, { habitId, date: t }];
    save(habits, newLogs);
  }

  function deleteHabit(id: string) {
    save(habits.filter(h => h.id !== id), logs.filter(l => l.habitId !== id));
  }

  async function getInsight() {
    if (habits.length === 0) return;
    setLoadingInsight(true);
    const summary = habits.map(h => {
      const days = last7().filter(d => logs.find(l => l.habitId === h.id && l.date === d)).length;
      return `${h.name}: ${days}/7 days`;
    }).join(", ");

    const moodsRaw = user ? localStorage.getItem(uKey(user.id, "moods")) : null;
    const moods = moodsRaw ? JSON.parse(moodsRaw).slice(-7) : [];

    const res = await fetch("/api/companion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{
          role: "user",
          content: `Based on this week's habit completion (${summary}) and mood data (${JSON.stringify(moods)}), give a warm 2-3 sentence insight about patterns you notice. Be specific and encouraging. No bullet points.`
        }]
      }),
    });
    if (res.body) {
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = "";
      while (true) { const { done, value } = await reader.read(); if (done) break; acc += dec.decode(value, { stream: true }); setInsight(acc); }
    }
    setLoadingInsight(false);
  }

  const days = last7();

  return (
    <div className="min-h-screen bg-slate-950 pb-8">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm px-4 sm:px-6 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => router.back()} className="text-slate-400 hover:text-white transition-colors p-1"><ArrowLeft className="w-5 h-5" /></button>
        <div className="flex-1">
          <h1 className="font-bold text-white">Habit Tracker</h1>
          <p className="text-xs text-slate-500">Build consistent routines</p>
        </div>
        <button onClick={() => setAdding(true)} className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl px-3 py-2 text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Add
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Add habit modal */}
        <AnimatePresence>
          {adding && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="bg-slate-900 border border-slate-700 rounded-2xl p-5 space-y-4">
              <p className="font-semibold text-white">New habit</p>
              <div className="flex gap-3 flex-wrap">
                {EMOJIS.map(e => (
                  <button key={e} onClick={() => setNewEmoji(e)}
                    className={`text-2xl p-1.5 rounded-xl transition-all ${newEmoji === e ? "bg-teal-500/20 ring-2 ring-teal-500" : "hover:bg-slate-800"}`}>
                    {e}
                  </button>
                ))}
              </div>
              <input autoFocus placeholder="Habit name e.g. Go for a walk"
                value={newName} onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addHabit()}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-500 transition-colors" />
              <div className="flex gap-2 flex-wrap">
                {COLORS.map(c => (
                  <button key={c} onClick={() => setNewColor(c)}
                    className={`w-8 h-8 rounded-full bg-gradient-to-br ${c} transition-transform ${newColor === c ? "scale-125 ring-2 ring-white" : ""}`} />
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setAdding(false)} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 text-sm hover:text-white transition-colors">Cancel</button>
                <button onClick={addHabit} className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium transition-colors">Add habit</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {habits.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <div className="text-5xl mb-4">🌱</div>
            <p className="font-medium text-white mb-1">No habits yet</p>
            <p className="text-sm">Add your first habit to start tracking</p>
          </div>
        ) : (
          <>
            {/* Habit cards with 7-day grid */}
            <div className="space-y-4">
              {habits.map(h => {
                const todayDone = !!logs.find(l => l.habitId === h.id && l.date === today());
                const s = streak(h.id, logs);
                return (
                  <motion.div key={h.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${h.color} flex items-center justify-center text-lg shrink-0`}>
                        {h.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold">{h.name}</p>
                        <p className="text-slate-500 text-xs">{s > 0 ? `🔥 ${s} day streak` : "Start your streak today!"}</p>
                      </div>
                      <button onClick={() => toggleLog(h.id)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                          todayDone ? `bg-gradient-to-br ${h.color} text-white shadow-lg` : "bg-slate-800 text-slate-600 hover:text-white hover:bg-slate-700"
                        }`}>
                        <Check className="w-5 h-5" />
                      </button>
                      <button onClick={() => deleteHabit(h.id)} className="p-2 text-slate-700 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {/* 7-day mini calendar */}
                    <div className="flex gap-1.5">
                      {days.map(d => {
                        const done = !!logs.find(l => l.habitId === h.id && l.date === d);
                        const isToday = d === today();
                        return (
                          <div key={d} className="flex-1 flex flex-col items-center gap-1">
                            <div className={`w-full aspect-square rounded-lg flex items-center justify-center text-xs transition-all ${
                              done ? `bg-gradient-to-br ${h.color} text-white` : isToday ? "bg-slate-700 border border-dashed border-slate-600 text-slate-500" : "bg-slate-800 text-slate-700"
                            }`}>
                              {done ? "✓" : ""}
                            </div>
                            <span className="text-[9px] text-slate-600">
                              {new Date(d + "T12:00:00").toLocaleDateString("en", { weekday: "narrow" })}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* AI Insight */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-teal-400" /> Weekly Insight
                </p>
                <button onClick={getInsight} disabled={loadingInsight}
                  className="text-xs text-teal-400 hover:text-teal-300 border border-teal-700/50 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                  {loadingInsight ? "Analysing…" : "Generate"}
                </button>
              </div>
              {insight ? (
                <p className="text-slate-300 text-sm leading-relaxed">{insight}</p>
              ) : (
                <p className="text-slate-500 text-sm">Click &ldquo;Generate&rdquo; for an AI analysis of your habit-mood patterns.</p>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
