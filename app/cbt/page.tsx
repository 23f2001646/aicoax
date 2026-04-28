"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Brain, ChevronRight, RefreshCw, CheckCircle } from "lucide-react";

interface CBTResult {
  situation: string;
  automatic_thought: string;
  emotion: string;
  emotion_intensity_before: number;
  cognitive_distortions: string[];
  distortion_explanations: string[];
  evidence_for: string[];
  evidence_against: string[];
  balanced_thought: string;
  emotion_intensity_after: number;
  coping_action: string;
}

const DISTORTION_COLORS: Record<string, string> = {
  catastrophizing: "bg-red-900/40 border-red-700/50 text-red-300",
  "all-or-nothing": "bg-orange-900/40 border-orange-700/50 text-orange-300",
  "mind-reading": "bg-purple-900/40 border-purple-700/50 text-purple-300",
  "fortune-telling": "bg-violet-900/40 border-violet-700/50 text-violet-300",
  "emotional-reasoning": "bg-pink-900/40 border-pink-700/50 text-pink-300",
  overgeneralizing: "bg-yellow-900/40 border-yellow-700/50 text-yellow-300",
  "should-statements": "bg-blue-900/40 border-blue-700/50 text-blue-300",
  labeling: "bg-teal-900/40 border-teal-700/50 text-teal-300",
};

function IntensityBar({ before, after }: { before: number; after: number }) {
  return (
    <div className="space-y-3">
      <div>
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>Before reframing</span><span>{before}/100</span>
        </div>
        <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${before}%` }} transition={{ duration: 0.8, delay: 0.2 }}
            className="h-full rounded-full" style={{ background: `hsl(${(1 - before / 100) * 120}, 70%, 50%)` }} />
        </div>
      </div>
      <div>
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>After reframing</span><span>{after}/100</span>
        </div>
        <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${after}%` }} transition={{ duration: 0.8, delay: 0.5 }}
            className="h-full rounded-full" style={{ background: `hsl(${(1 - after / 100) * 120}, 70%, 50%)` }} />
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 bg-teal-900/20 border border-teal-700/30 rounded-xl py-2">
        <CheckCircle className="w-4 h-4 text-teal-400" />
        <span className="text-sm text-teal-300 font-medium">{before - after} point reduction in intensity</span>
      </div>
    </div>
  );
}

export default function CBTPage() {
  const [step, setStep] = useState<"intro" | "form" | "loading" | "result">("intro");
  const [situation, setSituation] = useState("");
  const [thought, setThought] = useState("");
  const [emotion, setEmotion] = useState("");
  const [result, setResult] = useState<CBTResult | null>(null);
  const [error, setError] = useState("");

  const analyze = async () => {
    if (!situation.trim() || !thought.trim() || !emotion.trim()) {
      setError("Please fill in all three fields.");
      return;
    }
    setError("");
    setStep("loading");

    const res = await fetch("/api/cbt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ situation, thought, emotion }),
    });
    const data = await res.json();
    if (data.error) { setError("Couldn't analyze. Try again."); setStep("form"); return; }
    
    // Save to localStorage
    const savedResults = JSON.parse(localStorage.getItem("aicoax_cbt") || "[]");
    savedResults.unshift({ id: Date.now().toString(), date: new Date().toISOString(), ...data });
    localStorage.setItem("aicoax_cbt", JSON.stringify(savedResults.slice(0, 50)));

    setResult(data);
    setStep("result");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm px-4 sm:px-6 py-3 flex items-center gap-3">
        <Link href="/" className="text-slate-400 hover:text-white transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
        <div>
          <h1 className="font-bold text-white">Thought Record</h1>
          <p className="text-xs text-slate-500">CBT-based cognitive reframing</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <AnimatePresence mode="wait">
          {step === "intro" && (
            <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-900/40">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">CBT Thought Record</h2>
                <p className="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto">
                  Cognitive Behavioral Therapy helps you spot unhelpful thinking patterns and
                  replace them with balanced, realistic thoughts.
                </p>
              </div>

              <div className="space-y-3 mb-8">
                {[
                  { n: "1", t: "Describe the situation", d: "What happened? Be specific." },
                  { n: "2", t: "Your automatic thought", d: "What went through your mind?" },
                  { n: "3", t: "AI identifies distortions", d: "Patterns like catastrophizing, mind-reading..." },
                  { n: "4", t: "Balanced thought", d: "A more realistic, helpful perspective" },
                ].map((item) => (
                  <div key={item.n} className="flex gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <div className="w-7 h-7 rounded-full bg-amber-900/50 border border-amber-700/50 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-amber-400">{item.n}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{item.t}</p>
                      <p className="text-xs text-slate-500">{item.d}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={() => setStep("form")}
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl py-4 font-semibold flex items-center justify-center gap-2">
                Start Thought Record <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {step === "form" && (
            <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-5">
              <div>
                <label className="text-sm font-medium text-white block mb-2">What happened? <span className="text-slate-500 font-normal">(describe the situation)</span></label>
                <textarea value={situation} onChange={(e) => setSituation(e.target.value)}
                  placeholder="e.g. My manager gave me critical feedback in a meeting in front of the team"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none transition-colors"
                  rows={3} />
              </div>
              <div>
                <label className="text-sm font-medium text-white block mb-2">What thought immediately went through your mind?</label>
                <textarea value={thought} onChange={(e) => setThought(e.target.value)}
                  placeholder="e.g. Everyone thinks I'm incompetent. I'm going to get fired."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none transition-colors"
                  rows={2} />
              </div>
              <div>
                <label className="text-sm font-medium text-white block mb-2">What emotion did you feel? <span className="text-slate-500 font-normal">(e.g. shame, anxiety, anger)</span></label>
                <input value={emotion} onChange={(e) => setEmotion(e.target.value)}
                  placeholder="e.g. intense shame and anxiety"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors" />
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <button onClick={analyze} className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl py-4 font-semibold transition-all">
                Analyse My Thoughts
              </button>
            </motion.div>
          )}

          {step === "loading" && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-12 h-12 rounded-full border-3 border-amber-500/30 border-t-amber-500 animate-spin" />
              <p className="text-slate-400 text-sm">Analyzing thinking patterns...</p>
            </motion.div>
          )}

          {step === "result" && result && (
            <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-5">
              {/* Distortions */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <span className="text-xl">🔍</span> Thinking Patterns Found
                </h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {result.cognitive_distortions.map((d, i) => (
                    <span key={i} className={`text-xs px-3 py-1 rounded-full border ${DISTORTION_COLORS[d.toLowerCase().replace(/\s/g, "-")] || "bg-slate-800 border-slate-600 text-slate-300"}`}>
                      {d}
                    </span>
                  ))}
                </div>
                {result.distortion_explanations.map((ex, i) => (
                  <p key={i} className="text-xs text-slate-400 mb-1">• {ex}</p>
                ))}
              </div>

              {/* Evidence */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-red-900/20 border border-red-800/40 rounded-xl p-4">
                  <p className="text-xs font-semibold text-red-400 mb-2">Evidence FOR the thought</p>
                  {result.evidence_for.map((e, i) => <p key={i} className="text-xs text-slate-300 mb-1">• {e}</p>)}
                </div>
                <div className="bg-teal-900/20 border border-teal-800/40 rounded-xl p-4">
                  <p className="text-xs font-semibold text-teal-400 mb-2">Evidence AGAINST</p>
                  {result.evidence_against.map((e, i) => <p key={i} className="text-xs text-slate-300 mb-1">• {e}</p>)}
                </div>
              </div>

              {/* Balanced thought */}
              <div className="bg-gradient-to-br from-teal-900/30 to-emerald-900/30 border border-teal-700/40 rounded-2xl p-5">
                <p className="text-xs font-semibold text-teal-400 uppercase tracking-wide mb-2">Balanced Thought</p>
                <p className="text-white leading-relaxed">&quot;{result.balanced_thought}&quot;</p>
              </div>

              {/* Intensity */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h3 className="font-semibold text-white mb-4">Emotional Impact</h3>
                <IntensityBar before={result.emotion_intensity_before} after={result.emotion_intensity_after} />
              </div>

              {/* Coping action */}
              <div className="bg-amber-900/20 border border-amber-700/30 rounded-xl p-4 flex gap-3">
                <span className="text-xl">✅</span>
                <div>
                  <p className="text-xs font-semibold text-amber-400 mb-1">Action Step</p>
                  <p className="text-sm text-slate-300">{result.coping_action}</p>
                </div>
              </div>

              <button onClick={() => { setStep("form"); setSituation(""); setThought(""); setEmotion(""); setResult(null); }}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white rounded-xl py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4" /> New Thought Record
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
