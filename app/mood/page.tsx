"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, TrendingUp } from "lucide-react";
import { getMoods, saveMood, getTodayMood, type MoodEntry } from "@/lib/mood";

const MOODS = [
  { score: 1, emoji: "😔", label: "Very low", color: "bg-blue-900/60 border-blue-700" },
  { score: 2, emoji: "😢", label: "Low", color: "bg-blue-800/60 border-blue-600" },
  { score: 3, emoji: "😞", label: "Struggling", color: "bg-indigo-900/60 border-indigo-700" },
  { score: 4, emoji: "😕", label: "Not great", color: "bg-purple-900/60 border-purple-700" },
  { score: 5, emoji: "😐", label: "Okay", color: "bg-slate-800/60 border-slate-600" },
  { score: 6, emoji: "🙂", label: "Alright", color: "bg-teal-900/60 border-teal-700" },
  { score: 7, emoji: "😊", label: "Good", color: "bg-emerald-900/60 border-emerald-700" },
  { score: 8, emoji: "😄", label: "Great", color: "bg-green-900/60 border-green-700" },
  { score: 9, emoji: "😁", label: "Excellent", color: "bg-lime-900/60 border-lime-700" },
  { score: 10, emoji: "🤩", label: "Amazing", color: "bg-yellow-900/60 border-yellow-600" },
];

const EMOTIONS = ["anxious", "sad", "stressed", "tired", "angry", "numb", "calm", "hopeful", "grateful", "happy", "energized", "content"];

function moodColor(score: number) {
  if (score <= 3) return "#6366f1";
  if (score <= 5) return "#94a3b8";
  if (score <= 7) return "#14b8a6";
  return "#22c55e";
}

export default function MoodPage() {
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [todayMood, setTodayMood] = useState<MoodEntry | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [selectedEmotion, setSelectedEmotion] = useState("");
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setMoods(getMoods());
    const t = getTodayMood();
    setTodayMood(t);
    if (t) { setSelected(t.score); setSelectedEmotion(t.emotion); setNote(t.note); setSaved(true); }
  }, []);

  const submit = () => {
    if (!selected) return;
    const entry: MoodEntry = { date: new Date().toISOString(), score: selected, emotion: selectedEmotion, note };
    saveMood(entry);
    setTodayMood(entry);
    setMoods(getMoods());
    setSaved(true);
  };

  const avg = moods.length ? (moods.reduce((s, m) => s + m.score, 0) / moods.length).toFixed(1) : "—";
  const last7 = moods.slice(-7);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm px-4 sm:px-6 py-3 flex items-center gap-3">
        <Link href="/" className="text-slate-400 hover:text-white transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
        <div>
          <h1 className="font-bold text-white">Mood Tracker</h1>
          <p className="text-xs text-slate-500">Track patterns to understand yourself</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Today's check-in */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-400" />
              {saved ? "Today's mood" : "How are you feeling?"}
            </h2>
            {saved && <button onClick={() => setSaved(false)} className="text-xs text-teal-400 hover:text-teal-300">Update</button>}
          </div>

          {!saved ? (
            <>
              <div className="grid grid-cols-5 gap-2 mb-4">
                {MOODS.map((m) => (
                  <motion.button key={m.score} onClick={() => setSelected(m.score)}
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${
                      selected === m.score ? m.color : "border-transparent hover:bg-slate-800"
                    }`}>
                    <span className="text-xl">{m.emoji}</span>
                    <span className="text-[9px] text-slate-500 leading-none">{m.score}</span>
                  </motion.button>
                ))}
              </div>

              {selected && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <p className="text-xs text-slate-400 mb-2">Tag an emotion (optional)</p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {EMOTIONS.map((e) => (
                      <button key={e} onClick={() => setSelectedEmotion(selectedEmotion === e ? "" : e)}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                          selectedEmotion === e ? "bg-teal-600 border-teal-500 text-white" : "border-slate-700 text-slate-400 hover:border-slate-500"
                        }`}>
                        {e}
                      </button>
                    ))}
                  </div>
                  <textarea value={note} onChange={(e) => setNote(e.target.value)}
                    placeholder="What's contributing to this? (optional)"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 resize-none mb-3"
                    rows={2} />
                  <button onClick={submit} className="w-full bg-teal-600 hover:bg-teal-500 text-white rounded-xl py-3 text-sm font-semibold transition-colors">
                    Save Today&apos;s Mood
                  </button>
                </motion.div>
              )}
            </>
          ) : (
            <div className="text-center py-4">
              <span className="text-5xl">{MOODS.find(m => m.score === todayMood?.score)?.emoji || "😐"}</span>
              <p className="text-white font-semibold mt-2">{MOODS.find(m => m.score === todayMood?.score)?.label}</p>
              {todayMood?.emotion && <p className="text-sm text-slate-400 mt-1">Feeling {todayMood.emotion}</p>}
              {todayMood?.note && <p className="text-xs text-slate-500 mt-2 italic">&quot;{todayMood.note}&quot;</p>}
            </div>
          )}
        </div>

        {/* Stats */}
        {moods.length >= 3 && (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-white">{avg}</p>
              <p className="text-[10px] text-slate-500">Avg score</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-white">{moods.length}</p>
              <p className="text-[10px] text-slate-500">Days tracked</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-white">{Math.max(...moods.map(m => m.score))}</p>
              <p className="text-[10px] text-slate-500">Best day</p>
            </div>
          </div>
        )}

        {/* 7-day chart */}
        {last7.length >= 2 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-teal-400" />
              <h2 className="font-semibold text-white text-sm">Last {last7.length} days</h2>
            </div>
            <div className="flex items-end gap-2 h-24">
              {last7.map((m, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <motion.div
                    initial={{ height: 0 }} animate={{ height: `${(m.score / 10) * 80}px` }}
                    transition={{ delay: i * 0.05, duration: 0.5 }}
                    className="w-full rounded-t-md"
                    style={{ backgroundColor: moodColor(m.score) }} />
                  <span className="text-[9px] text-slate-600">
                    {new Date(m.date).toLocaleDateString("en", { weekday: "short" })[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* History */}
        {moods.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h2 className="font-semibold text-white text-sm mb-3">History</h2>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {[...moods].reverse().map((m, i) => (
                <div key={i} className="flex items-center gap-3 py-1.5">
                  <span className="text-xl">{MOODS.find(md => md.score === m.score)?.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white font-medium">{MOODS.find(md => md.score === m.score)?.label}</span>
                      {m.emotion && <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">{m.emotion}</span>}
                    </div>
                    {m.note && <p className="text-xs text-slate-500 truncate">{m.note}</p>}
                  </div>
                  <span className="text-xs text-slate-600 shrink-0">
                    {new Date(m.date).toLocaleDateString("en", { month: "short", day: "numeric" })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {moods.length === 0 && saved === false && (
          <p className="text-center text-slate-600 text-sm">Track your first mood above to see patterns over time.</p>
        )}
      </main>
    </div>
  );
}
