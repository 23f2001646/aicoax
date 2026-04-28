"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Copy, Check, TrendingUp, TrendingDown, Minus, Calendar, Zap } from "lucide-react";
import { useApp } from "@/components/AppProviders";
import { uKey } from "@/lib/auth";

interface MoodEntry { date: string; mood: number; note?: string; }
interface Report {
  summary: string;
  trend: "improving" | "stable" | "declining" | "mixed";
  trendNote: string;
  topEmotions: string[];
  strengths: string[];
  challenges: string[];
  suggestions: string[];
  affirmation: string;
  weekOverWeek?: string;
  dayPatterns?: string;
  triggers?: string[];
}

const MOOD_EMOJIS = ["😞","😔","😐","🙂","😊","😄"];
const MOOD_LABELS = ["Very Low","Low","Neutral","Good","Great","Excellent"];
const TREND_STYLES = {
  improving: { color: "text-green-400", bg: "bg-green-900/20 border-green-700/40", Icon: TrendingUp, label: "Improving" },
  stable:    { color: "text-blue-400",  bg: "bg-blue-900/20 border-blue-700/40",   Icon: Minus,      label: "Stable" },
  declining: { color: "text-red-400",   bg: "bg-red-900/20 border-red-700/40",     Icon: TrendingDown,label: "Needs attention" },
  mixed:     { color: "text-yellow-400",bg: "bg-yellow-900/20 border-yellow-700/40",Icon: Minus,     label: "Mixed" },
};

function getWeekAvg(moods: MoodEntry[], weeksAgo: number) {
  const end = new Date(); end.setDate(end.getDate() - weeksAgo * 7);
  const start = new Date(end); start.setDate(start.getDate() - 7);
  const slice = moods.filter(m => m.date >= start.toISOString().slice(0,10) && m.date < end.toISOString().slice(0,10));
  return slice.length ? slice.reduce((s,m) => s + m.mood, 0) / slice.length : null;
}

function getDayPatterns(moods: MoodEntry[]) {
  const byDay: Record<number, number[]> = {};
  moods.forEach(m => {
    const day = new Date(m.date + "T12:00:00").getDay();
    if (!byDay[day]) byDay[day] = [];
    byDay[day].push(m.mood);
  });
  const avgs = Object.entries(byDay).map(([d, vals]) => ({
    day: parseInt(d),
    avg: vals.reduce((s,v) => s+v, 0) / vals.length,
  }));
  if (avgs.length < 3) return null;
  const best = avgs.sort((a,b) => b.avg - a.avg)[0];
  const worst = avgs[avgs.length-1];
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  return { best: days[best.day], worst: days[worst.day], bestAvg: best.avg.toFixed(1), worstAvg: worst.avg.toFixed(1) };
}

export default function ReportPage() {
  const { user, prefs } = useApp();
  const router = useRouter();
  const [moods, setMoods]     = useState<MoodEntry[]>([]);
  const [report, setReport]   = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkin, setCheckin] = useState<number | null>(null);
  const [note, setNote]       = useState("");
  const [todayDone, setTodayDone] = useState(false);
  const [copied, setCopied]   = useState(false);
  const [tab, setTab]         = useState<"overview"|"patterns"|"export">("overview");

  useEffect(() => {
    if (!user) return;
    const raw = localStorage.getItem(uKey(user.id, "moods"));
    const data: MoodEntry[] = raw ? JSON.parse(raw) : [];
    setMoods(data);
    const today = new Date().toISOString().slice(0, 10);
    setTodayDone(data.some(m => m.date === today));
  }, [user]);

  function saveMood() {
    if (!user || checkin === null) return;
    const today = new Date().toISOString().slice(0, 10);
    const entry: MoodEntry = { date: today, mood: checkin, note };
    const updated = [...moods.filter(m => m.date !== today), entry].sort((a,b) => a.date.localeCompare(b.date));
    localStorage.setItem(uKey(user!.id, "moods"), JSON.stringify(updated));
    setMoods(updated);
    setTodayDone(true);
    setCheckin(null);
    setNote("");
  }

  const generateReport = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const last14 = moods.slice(-14);
    const gratRaw = localStorage.getItem(uKey(user.id, "gratitude"));
    const gratItems = gratRaw ? JSON.parse(gratRaw).slice(-7).flatMap((e: {items:string[]}) => e.items) : [];
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moods: last14,
          sessions: { thisWeek: parseInt(localStorage.getItem(uKey(user.id, "sessionCount")) ?? "0") },
          gratitudeItems: gratItems,
          name: prefs?.mayaCallsMe || "friend",
        }),
      });
      const data = await res.json();
      setReport(data);
    } finally {
      setLoading(false);
    }
  }, [moods, user, prefs]);

  const last7 = moods.slice(-7);
  const thisWeekAvg = getWeekAvg(moods, 0) ?? (last7.length ? last7.reduce((s,m)=>s+m.mood,0)/last7.length : null);
  const lastWeekAvg = getWeekAvg(moods, 1);
  const dayPatterns = getDayPatterns(moods);
  const wowDiff = thisWeekAvg && lastWeekAvg ? (thisWeekAvg - lastWeekAvg).toFixed(1) : null;

  function buildExportText() {
    if (!report) return "";
    const name = prefs?.mayaCallsMe || "User";
    const date = new Date().toLocaleDateString("en", { year:"numeric", month:"long", day:"numeric" });
    return `AiCoax Wellbeing Report — ${name}
Generated: ${date}
────────────────────────────
Trend: ${TREND_STYLES[report.trend].label}
${thisWeekAvg ? `This week avg mood: ${thisWeekAvg.toFixed(1)}/5` : ""}${wowDiff ? ` (${parseFloat(wowDiff)>0?"+":""}${wowDiff} vs last week)` : ""}
${dayPatterns ? `Best day: ${dayPatterns.best} (avg ${dayPatterns.bestAvg}/5) · Hardest: ${dayPatterns.worst} (avg ${dayPatterns.worstAvg}/5)` : ""}

SUMMARY
${report.summary}

${report.topEmotions?.length ? `TOP EMOTIONS\n${report.topEmotions.join(", ")}\n` : ""}
${report.strengths?.length ? `STRENGTHS\n${report.strengths.map(s => "✓ "+s).join("\n")}\n` : ""}
${report.challenges?.length ? `AREAS TO FOCUS\n${report.challenges.map(c => "◦ "+c).join("\n")}\n` : ""}
${report.suggestions?.length ? `SUGGESTIONS\n${report.suggestions.join("\n")}\n` : ""}
${report.triggers?.length ? `POSSIBLE TRIGGERS\n${report.triggers.join(", ")}\n` : ""}
AFFIRMATION
"${report.affirmation}"
────────────────────────────
Generated by AiCoax · aicoax.app`;
  }

  async function copyExport() {
    await navigator.clipboard.writeText(buildExportText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const tStyle = report ? TREND_STYLES[report.trend] : null;

  return (
    <div className="min-h-screen bg-slate-950 pb-8">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm px-4 sm:px-6 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => router.back()} className="text-slate-400 hover:text-white p-1 transition-colors"><ArrowLeft className="w-5 h-5" /></button>
        <div className="flex-1">
          <h1 className="font-bold text-white">Wellbeing Report</h1>
          <p className="text-xs text-slate-500">Track your mental health journey</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* Daily Check-in */}
        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
          <p className="text-white font-semibold mb-1">Today&apos;s Check-in</p>
          {todayDone ? (
            <p className="text-teal-400 text-sm">✓ Logged for today — great habit!</p>
          ) : (
            <div className="space-y-3">
              <p className="text-slate-400 text-sm">How are you feeling?</p>
              <div className="flex gap-1.5">
                {MOOD_EMOJIS.map((emoji, i) => (
                  <button key={i} onClick={() => setCheckin(i)}
                    className={`flex-1 flex flex-col items-center gap-1 rounded-xl py-2 border-2 transition-all ${
                      checkin === i ? "border-teal-500 bg-teal-900/20 scale-105" : "border-slate-700 bg-slate-800 hover:border-slate-600"
                    }`}>
                    <span className="text-xl">{emoji}</span>
                    <span className="text-[9px] text-slate-500 hidden sm:block">{MOOD_LABELS[i]}</span>
                  </button>
                ))}
              </div>
              <AnimatePresence>
                {checkin !== null && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-2 overflow-hidden">
                    <input type="text" placeholder="Optional note — what's on your mind?" value={note} onChange={e => setNote(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-500 transition-colors" />
                    <button onClick={saveMood} className="w-full bg-teal-600 hover:bg-teal-500 text-white rounded-xl py-2.5 text-sm font-medium transition-colors">
                      Save Check-in
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Stats row */}
        {moods.length >= 2 && (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold text-white">{thisWeekAvg?.toFixed(1) ?? "—"}</p>
              <p className="text-slate-500 text-xs mt-1">This week avg</p>
            </div>
            <div className={`border rounded-2xl p-4 text-center ${wowDiff ? (parseFloat(wowDiff) >= 0 ? "bg-green-900/20 border-green-700/40" : "bg-red-900/20 border-red-700/40") : "bg-slate-900 border-slate-800"}`}>
              <p className={`text-2xl font-bold ${wowDiff ? (parseFloat(wowDiff) >= 0 ? "text-green-400" : "text-red-400") : "text-slate-500"}`}>
                {wowDiff ? (parseFloat(wowDiff) > 0 ? "+" : "") + wowDiff : "—"}
              </p>
              <p className="text-slate-500 text-xs mt-1">vs last week</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold text-white">{moods.length}</p>
              <p className="text-slate-500 text-xs mt-1">Total entries</p>
            </div>
          </div>
        )}

        {/* 7-day bar chart */}
        {moods.length > 0 && (
          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
            <p className="text-white font-semibold mb-3">Last 7 days</p>
            <div className="flex gap-1.5 items-end h-16">
              {Array.from({ length: 7 }).map((_, i) => {
                const date = new Date(); date.setDate(date.getDate() - (6 - i));
                const d = date.toISOString().slice(0, 10);
                const entry = moods.find(m => m.date === d);
                const h = entry ? Math.max(8, (entry.mood / 5) * 56) : 4;
                const isToday = i === 6;
                return (
                  <div key={d} className="flex-1 flex flex-col items-center gap-1" title={entry ? `${MOOD_LABELS[entry.mood]}${entry.note ? ": " + entry.note : ""}` : d}>
                    <div className={`w-full rounded-t transition-all ${entry ? (isToday ? "bg-teal-400" : "bg-teal-600") : "bg-slate-800"}`} style={{ height: h }} />
                    <span className="text-slate-600 text-[9px]">{date.toLocaleDateString("en", { weekday: "narrow" })}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Day patterns */}
        {dayPatterns && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <p className="font-semibold text-white flex items-center gap-2"><Calendar className="w-4 h-4 text-blue-400" /> Day-of-Week Patterns</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-900/20 border border-green-700/30 rounded-xl p-3">
                <p className="text-green-400 text-xs font-medium">Best day ✨</p>
                <p className="text-white font-bold mt-1">{dayPatterns.best}</p>
                <p className="text-green-400 text-xs">avg {dayPatterns.bestAvg}/5</p>
              </div>
              <div className="bg-red-900/20 border border-red-700/30 rounded-xl p-3">
                <p className="text-red-400 text-xs font-medium">Hardest day</p>
                <p className="text-white font-bold mt-1">{dayPatterns.worst}</p>
                <p className="text-red-400 text-xs">avg {dayPatterns.worstAvg}/5</p>
              </div>
            </div>
          </div>
        )}

        {/* Generate button */}
        <button onClick={generateReport} disabled={loading || moods.length === 0}
          className="w-full bg-gradient-to-r from-purple-700 to-indigo-700 hover:opacity-90 disabled:opacity-50 text-white rounded-2xl py-4 font-semibold transition-opacity flex items-center justify-center gap-2">
          {loading ? (
            <><div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> Generating AI Report…</>
          ) : moods.length === 0 ? "Add check-ins first" : "✨ Generate AI Wellbeing Report"}
        </button>

        {/* Report card */}
        <AnimatePresence>
          {report && tStyle && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              {/* Tab bar */}
              <div className="flex border-b border-slate-800">
                {(["overview","patterns","export"] as const).map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    className={`flex-1 py-3 text-sm font-medium capitalize transition-colors ${tab === t ? "text-white border-b-2 border-teal-400" : "text-slate-500 hover:text-slate-300"}`}>
                    {t}
                  </button>
                ))}
              </div>

              <div className="p-5 space-y-5">
                {tab === "overview" && (
                  <>
                    <div className={`flex items-center gap-2 border rounded-xl px-4 py-3 ${tStyle.bg}`}>
                      <tStyle.Icon className={`w-5 h-5 ${tStyle.color}`} />
                      <span className={`font-semibold ${tStyle.color}`}>{tStyle.label}</span>
                      <span className="text-slate-400 text-sm ml-auto">{report.trendNote}</span>
                    </div>
                    <p className="text-white text-sm leading-relaxed">{report.summary}</p>
                    {report.weekOverWeek && <p className="text-slate-400 text-sm leading-relaxed">{report.weekOverWeek}</p>}

                    {report.topEmotions?.length > 0 && (
                      <div>
                        <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">Top emotions</p>
                        <div className="flex flex-wrap gap-2">
                          {report.topEmotions.map(e => <span key={e} className="bg-slate-800 text-slate-300 text-xs px-3 py-1 rounded-full">{e}</span>)}
                        </div>
                      </div>
                    )}
                    {report.strengths?.length > 0 && (
                      <div>
                        <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">Your strengths</p>
                        {report.strengths.map((s,i) => <p key={i} className="text-green-400 text-sm">✓ {s}</p>)}
                      </div>
                    )}
                    {report.challenges?.length > 0 && (
                      <div>
                        <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">Areas to focus</p>
                        {report.challenges.map((c,i) => <p key={i} className="text-yellow-400 text-sm">◦ {c}</p>)}
                      </div>
                    )}
                    {report.suggestions?.length > 0 && (
                      <div>
                        <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">Suggestions</p>
                        <div className="space-y-2">
                          {report.suggestions.map((s,i) => <div key={i} className="bg-slate-800 rounded-xl p-3 text-slate-300 text-sm">{s}</div>)}
                        </div>
                      </div>
                    )}
                    <div className="bg-teal-900/30 border border-teal-800/40 rounded-xl p-4">
                      <p className="text-teal-300 text-sm italic">&ldquo;{report.affirmation}&rdquo;</p>
                    </div>
                  </>
                )}

                {tab === "patterns" && (
                  <div className="space-y-4">
                    {report.dayPatterns && (
                      <div>
                        <p className="text-slate-400 text-xs uppercase tracking-wider mb-2 flex items-center gap-1"><Calendar className="w-3 h-3" /> Day Patterns</p>
                        <p className="text-slate-300 text-sm leading-relaxed">{report.dayPatterns}</p>
                      </div>
                    )}
                    {report.triggers && report.triggers.length > 0 && (
                      <div>
                        <p className="text-slate-400 text-xs uppercase tracking-wider mb-2 flex items-center gap-1"><Zap className="w-3 h-3" /> Possible Triggers</p>
                        <div className="flex flex-wrap gap-2">
                          {report.triggers.map(t => <span key={t} className="bg-orange-900/30 border border-orange-700/40 text-orange-300 text-xs px-3 py-1.5 rounded-full">{t}</span>)}
                        </div>
                      </div>
                    )}
                    {dayPatterns && (
                      <div className="bg-slate-800 rounded-xl p-4 space-y-2">
                        <p className="text-white text-sm font-medium">From your data</p>
                        <p className="text-slate-400 text-sm">🌟 {dayPatterns.best}s tend to be your best days ({dayPatterns.bestAvg}/5 avg)</p>
                        <p className="text-slate-400 text-sm">💪 {dayPatterns.worst}s can feel harder ({dayPatterns.worstAvg}/5 avg) — plan extra self-care</p>
                      </div>
                    )}
                    {!report.dayPatterns && !report.triggers?.length && !dayPatterns && (
                      <p className="text-slate-500 text-sm text-center py-8">Keep logging check-ins to unlock pattern insights</p>
                    )}
                  </div>
                )}

                {tab === "export" && (
                  <div className="space-y-4">
                    <p className="text-slate-400 text-sm">Share this report with a therapist or keep it as a personal record.</p>
                    <pre className="bg-slate-800 rounded-xl p-4 text-slate-300 text-xs whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
                      {buildExportText()}
                    </pre>
                    <button onClick={copyExport}
                      className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl py-3 font-medium transition-colors">
                      {copied ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy Report</>}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
