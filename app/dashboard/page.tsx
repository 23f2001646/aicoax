"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, Brain, Wind, BookOpen, TrendingDown, PenLine, AlertTriangle, Flame } from "lucide-react";
import { getMoods } from "@/lib/mood";

const TOOLS = [
  { href: "/friend",     emoji: "🧡",  label: "Maya",        sub: "Your AI best friend",          color: "from-pink-600 to-rose-600",     border: "border-pink-700/40"   },
  { href: "/breathe",    icon: Wind,   label: "Breathe",     sub: "Calm in 2 minutes",             color: "from-teal-600 to-cyan-600",     border: "border-teal-700/40"   },
  { href: "/understand", icon: BookOpen, label: "Learn",     sub: "Mental health library",         color: "from-violet-600 to-purple-600", border: "border-violet-700/40" },
  { href: "/mood",       icon: Heart,  label: "Mood",        sub: "Track daily feelings",          color: "from-rose-600 to-pink-600",     border: "border-rose-700/40"   },
  { href: "/cbt",        icon: Brain,  label: "CBT",         sub: "Reframe unhelpful thoughts",    color: "from-amber-600 to-orange-600",  border: "border-amber-700/40"  },
  { href: "/burnout",    icon: TrendingDown, label: "Burnout", sub: "Check your burnout level",   color: "from-orange-600 to-red-600",    border: "border-orange-700/40" },
  { href: "/journal",    icon: PenLine, label: "Journal",    sub: "Write with AI insight",         color: "from-indigo-600 to-blue-600",   border: "border-indigo-700/40" },
  { href: "/crisis",     icon: AlertTriangle, label: "Crisis", sub: "Real human support",         color: "from-red-600 to-red-700",       border: "border-red-700/40"    },
];

function moodColor(s: number) {
  if (s <= 3) return "#6366f1";
  if (s <= 5) return "#94a3b8";
  if (s <= 7) return "#14b8a6";
  return "#22c55e";
}

const EMOJI: Record<number, string> = {1:"😔",2:"😢",3:"😞",4:"😕",5:"😐",6:"🙂",7:"😊",8:"😄",9:"😁",10:"🤩"};

export default function DashboardPage() {
  const [moods, setMoods]           = useState<{ date: string; score: number }[]>([]);
  const [streak, setStreak]         = useState(0);
  const [journalCount, setJournalCount] = useState(0);
  const [cbtCount, setCbtCount]     = useState(0);

  useEffect(() => {
    const m = getMoods();
    setMoods(m);

    // Streak calc
    const sorted = [...m].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    let s = 0;
    const check = new Date();
    for (const entry of sorted) {
      if (new Date(entry.date).toDateString() === check.toDateString()) {
        s++; check.setDate(check.getDate() - 1);
      } else break;
    }
    if (sorted[0] && new Date(sorted[0].date).toDateString() !== new Date().toDateString()) s = 0;
    setStreak(s);

    try {
      setJournalCount(JSON.parse(localStorage.getItem("aicoax_journal") || "[]").length);
      setCbtCount(JSON.parse(localStorage.getItem("aicoax_cbt") || "[]").length);
    } catch {}
  }, []);

  const last7   = moods.slice(-7);
  const avgMood = last7.length ? (last7.reduce((s, m) => s + m.score, 0) / last7.length).toFixed(1) : null;
  const today   = moods.find(m => new Date(m.date).toDateString() === new Date().toDateString());

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <Link href="/" className="text-slate-400 hover:text-white transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
        <div>
          <h1 className="font-bold text-white">Dashboard</h1>
          <p className="text-xs text-slate-500">Your mental wellness overview</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: <Flame className="w-4 h-4 text-orange-400" />, value: streak, label: "day streak" },
            { icon: <Heart className="w-4 h-4 text-rose-400" />,   value: avgMood ?? "—", label: "avg mood (7d)" },
            { icon: <Brain className="w-4 h-4 text-violet-400" />, value: journalCount + cbtCount, label: "sessions" },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">{s.icon}<span className="text-2xl font-black text-white">{s.value}</span></div>
              <p className="text-[10px] text-slate-500">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Today mood */}
        {today ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-teal-900/30 to-cyan-900/20 border border-teal-800/40 rounded-2xl p-4 flex items-center gap-4">
            <span className="text-4xl">{EMOJI[today.score] || "😐"}</span>
            <div>
              <p className="text-xs text-teal-400 font-medium uppercase tracking-wide">Today</p>
              <p className="text-white font-semibold">Mood: {today.score}/10</p>
            </div>
            <Link href="/mood" className="ml-auto text-xs text-teal-400 hover:text-white border border-teal-700/50 px-3 py-1.5 rounded-lg transition-colors">Update</Link>
          </motion.div>
        ) : (
          <Link href="/mood">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-slate-900 border border-dashed border-slate-700 hover:border-teal-600 rounded-2xl p-4 flex items-center gap-3 transition-colors">
              <Heart className="w-8 h-8 text-slate-600" />
              <div>
                <p className="text-white font-medium text-sm">Log today&apos;s mood</p>
                <p className="text-xs text-slate-500">You haven&apos;t checked in yet</p>
              </div>
              <span className="ml-auto text-slate-500">→</span>
            </motion.div>
          </Link>
        )}

        {/* 7-day chart */}
        {last7.length >= 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-4">7-Day Mood</p>
            <div className="flex items-end gap-2 h-20">
              {last7.map((m, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <motion.div initial={{ height: 0 }} animate={{ height: `${(m.score / 10) * 70}px` }}
                    transition={{ delay: i * 0.06, duration: 0.5 }}
                    className="w-full rounded-t-lg" style={{ backgroundColor: moodColor(m.score) }} />
                  <span className="text-[9px] text-slate-600">
                    {new Date(m.date).toLocaleDateString("en", { weekday: "short" })[0]}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Tools grid */}
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">All Tools</p>
          <div className="grid grid-cols-2 gap-3">
            {TOOLS.map((t, i) => (
              <motion.div key={t.href} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
                <Link href={t.href}
                  className={`flex items-center gap-3 bg-slate-900 border ${t.border} hover:border-slate-600 rounded-2xl p-4 transition-all group hover:bg-slate-800/50`}>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center shrink-0 text-white group-hover:scale-105 transition-transform`}>
                    {"emoji" in t
                      ? <span className="text-xl">{t.emoji}</span>
                      : <t.icon className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">{t.label}</p>
                    <p className="text-[10px] text-slate-500 truncate">{t.sub}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="bg-amber-950/20 border border-amber-900/30 rounded-xl p-4 text-center">
          <p className="text-xs text-amber-700/80 leading-relaxed">
            AiCoax is a mental wellness companion — not a medical tool.
            <Link href="/crisis" className="underline ml-1">Crisis resources →</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
