"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, TrendingDown, ChevronRight, AlertCircle } from "lucide-react";

interface BurnoutResult {
  overall_level: string;
  score: number;
  dimensions: {
    exhaustion: { score: number; label: string; insight: string };
    cynicism: { score: number; label: string; insight: string };
    efficacy: { score: number; label: string; insight: string };
    balance: { score: number; label: string; insight: string };
  };
  key_stressors: string[];
  immediate_actions: string[];
  week_plan: string[];
  professional_help_needed: boolean;
  message: string;
}

const QUESTIONS = [
  { id: "exhaustion1", dim: "exhaustion", text: "I feel emotionally drained by my work/studies", scale: true },
  { id: "exhaustion2", dim: "exhaustion", text: "I feel used up at the end of the workday", scale: true },
  { id: "cynicism1", dim: "cynicism", text: "I have become less interested in my work since I started this job/course", scale: true },
  { id: "cynicism2", dim: "cynicism", text: "I doubt the significance of my work", scale: true },
  { id: "efficacy1", dim: "efficacy", text: "I feel I accomplish many worthwhile things in my work", scale: true },
  { id: "efficacy2", dim: "efficacy", text: "I feel confident that I am effective at getting things done", scale: true },
  { id: "balance1", dim: "balance", text: "I can disconnect from work/studies in my personal time", scale: true },
  { id: "balance2", dim: "balance", text: "I get enough time for rest and recovery", scale: true },
];

const SCALE = [
  { value: 0, label: "Never" },
  { value: 1, label: "Rarely" },
  { value: 2, label: "Sometimes" },
  { value: 3, label: "Often" },
  { value: 4, label: "Always" },
];

const LEVEL_CONFIG: Record<string, { color: string; bg: string; icon: string }> = {
  low: { color: "text-green-400", bg: "bg-green-900/30 border-green-700/40", icon: "✅" },
  moderate: { color: "text-yellow-400", bg: "bg-yellow-900/30 border-yellow-700/40", icon: "⚠️" },
  high: { color: "text-orange-400", bg: "bg-orange-900/30 border-orange-700/40", icon: "🔥" },
  severe: { color: "text-red-400", bg: "bg-red-900/30 border-red-700/40", icon: "🆘" },
};

export default function BurnoutPage() {
  const [step, setStep] = useState<"intro" | "questions" | "loading" | "result">("intro");
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<BurnoutResult | null>(null);

  const answer = (val: number) => {
    const q = QUESTIONS[qIdx];
    const newAnswers = { ...answers, [q.id]: val };
    setAnswers(newAnswers);
    if (qIdx < QUESTIONS.length - 1) {
      setQIdx(qIdx + 1);
    } else {
      submit(newAnswers);
    }
  };

  const submit = async (finalAnswers: Record<string, number>) => {
    setStep("loading");
    const res = await fetch("/api/burnout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: finalAnswers }),
    });
    const data = await res.json();
    
    // Save to localStorage
    const savedResults = JSON.parse(localStorage.getItem("aicoax_burnout") || "[]");
    savedResults.unshift({ id: Date.now().toString(), date: new Date().toISOString(), ...data });
    localStorage.setItem("aicoax_burnout", JSON.stringify(savedResults.slice(0, 20)));

    setResult(data);
    setStep("result");
  };

  const progress = ((qIdx + 1) / QUESTIONS.length) * 100;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm px-4 py-3 flex items-center gap-3">
        <Link href="/" className="text-slate-400 hover:text-white transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
        <div>
          <h1 className="font-bold text-white">Burnout Check</h1>
          <p className="text-xs text-slate-500">Evidence-based Maslach Burnout Inventory</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {step === "intro" && (
            <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-900/40">
                  <TrendingDown className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Burnout Assessment</h2>
                <p className="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto">
                  8 questions based on the Maslach Burnout Inventory — the gold standard in burnout research.
                  Takes 2 minutes. Completely private.
                </p>
              </div>
              <div className="bg-amber-900/20 border border-amber-700/30 rounded-xl p-4 mb-6 flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-200/80">This is not a medical diagnosis. For severe burnout or mental health concerns, please speak with a healthcare professional.</p>
              </div>
              <button onClick={() => setStep("questions")}
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl py-4 font-semibold flex items-center justify-center gap-2">
                Begin Assessment <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {step === "questions" && (
            <motion.div key="questions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Progress */}
              <div className="mb-6">
                <div className="flex justify-between text-xs text-slate-500 mb-2">
                  <span>Question {qIdx + 1} of {QUESTIONS.length}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                    animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div key={qIdx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}>
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6 min-h-[120px] flex items-center">
                    <p className="text-lg text-white font-medium leading-relaxed">
                      &quot;{QUESTIONS[qIdx].text}&quot;
                    </p>
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    {SCALE.map((s) => (
                      <motion.button key={s.value} onClick={() => answer(s.value)}
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        className="flex flex-col items-center gap-2 bg-slate-800 hover:bg-orange-900/40 hover:border-orange-600 border border-slate-700 rounded-xl p-3 transition-all">
                        <span className="text-xl font-bold text-white">{s.value}</span>
                        <span className="text-[9px] text-slate-400 text-center leading-tight">{s.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}

          {step === "loading" && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
              <p className="text-slate-400 text-sm">Analysing your burnout profile...</p>
            </motion.div>
          )}

          {step === "result" && result && (
            <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-5">
              {/* Overall */}
              <div className={`rounded-2xl border p-6 text-center ${LEVEL_CONFIG[result.overall_level]?.bg || "bg-slate-900 border-slate-800"}`}>
                <span className="text-4xl mb-2 block">{LEVEL_CONFIG[result.overall_level]?.icon}</span>
                <p className={`text-2xl font-black mb-1 ${LEVEL_CONFIG[result.overall_level]?.color}`}>
                  {result.overall_level.charAt(0).toUpperCase() + result.overall_level.slice(1)} Burnout
                </p>
                <p className="text-slate-400 text-sm leading-relaxed mt-2">{result.message}</p>
              </div>

              {/* Dimensions */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h3 className="font-semibold text-white mb-4 text-sm">Burnout Dimensions</h3>
                <div className="space-y-4">
                  {(["exhaustion", "cynicism", "efficacy", "balance"] as const).map((dim) => {
                    const d = result.dimensions[dim];
                    return (
                      <div key={dim}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400 capitalize">{dim}</span>
                          <span className="text-white">{d.label}</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-1">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${d.score}%` }} transition={{ duration: 0.8, delay: 0.1 }}
                            className="h-full rounded-full"
                            style={{ background: d.score > 70 ? "#ef4444" : d.score > 50 ? "#f97316" : "#22c55e" }} />
                        </div>
                        <p className="text-[11px] text-slate-500">{d.insight}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Immediate actions */}
              <div className="bg-teal-900/20 border border-teal-700/30 rounded-2xl p-5">
                <h3 className="font-semibold text-teal-300 mb-3 text-sm">Do These Today</h3>
                <ul className="space-y-2">
                  {result.immediate_actions.map((a, i) => (
                    <li key={i} className="flex gap-2 text-sm text-slate-300">
                      <span className="text-teal-400 shrink-0">→</span>{a}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Week plan */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h3 className="font-semibold text-white mb-3 text-sm">7-Day Recovery Plan</h3>
                <div className="space-y-2">
                  {result.week_plan.map((day, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <span className="text-xs text-slate-500 bg-slate-800 rounded-full w-6 h-6 flex items-center justify-center shrink-0 font-medium">{i + 1}</span>
                      <span className="text-sm text-slate-300">{day}</span>
                    </div>
                  ))}
                </div>
              </div>

              {result.professional_help_needed && (
                <div className="bg-red-900/20 border border-red-700/40 rounded-xl p-4 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-300 mb-1">Professional support recommended</p>
                    <p className="text-xs text-slate-400">Your burnout level suggests speaking with a therapist or counselor would significantly help. <Link href="/crisis" className="text-red-300 underline">Find resources →</Link></p>
                  </div>
                </div>
              )}

              <button onClick={() => { setStep("intro"); setAnswers({}); setQIdx(0); setResult(null); }}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white rounded-xl py-3 text-sm font-medium transition-colors">
                Retake Assessment
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
