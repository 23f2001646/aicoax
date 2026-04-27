"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Play, Pause, RotateCcw } from "lucide-react";

const EXERCISES = [
  {
    id: "478",
    name: "4-7-8 Breathing",
    subtitle: "Calms the nervous system in minutes",
    color: "from-teal-600 to-cyan-600",
    ring: "bg-teal-500",
    phases: [
      { label: "Inhale", duration: 4, instruction: "Breathe in slowly through your nose" },
      { label: "Hold", duration: 7, instruction: "Hold your breath gently" },
      { label: "Exhale", duration: 8, instruction: "Breathe out completely through your mouth" },
    ],
    benefit: "Activates parasympathetic nervous system. Reduces anxiety instantly.",
  },
  {
    id: "box",
    name: "Box Breathing",
    subtitle: "Used by Navy SEALs to stay calm",
    color: "from-violet-600 to-purple-600",
    ring: "bg-violet-500",
    phases: [
      { label: "Inhale", duration: 4, instruction: "Breathe in slowly" },
      { label: "Hold", duration: 4, instruction: "Hold at the top" },
      { label: "Exhale", duration: 4, instruction: "Breathe out slowly" },
      { label: "Hold", duration: 4, instruction: "Hold at the bottom" },
    ],
    benefit: "Regulates heart rate. Builds focus and emotional control.",
  },
  {
    id: "diaphragmatic",
    name: "Deep Belly Breathing",
    subtitle: "The foundation of relaxation",
    color: "from-emerald-600 to-teal-600",
    ring: "bg-emerald-500",
    phases: [
      { label: "Inhale", duration: 5, instruction: "Let your belly expand, not your chest" },
      { label: "Exhale", duration: 6, instruction: "Let your belly fall, release all tension" },
    ],
    benefit: "Directly counters fight-or-flight response. Lowers cortisol.",
  },
];

export default function BreathePage() {
  const [selected, setSelected] = useState(EXERCISES[0]);
  const [running, setRunning] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [cycles, setCycles] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const phase = selected.phases[phaseIdx];
  const totalDuration = selected.phases.reduce((s, p) => s + p.duration, 0);

  // Use refs to avoid stale closure in the interval
  const phaseIdxRef = useRef(phaseIdx);
  const selectedRef = useRef(selected);
  useEffect(() => { phaseIdxRef.current = phaseIdx; }, [phaseIdx]);
  useEffect(() => { selectedRef.current = selected; }, [selected]);

  const stop = useCallback(() => {
    setRunning(false);
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  const start = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhaseIdx(0);
    phaseIdxRef.current = 0;
    setTimeLeft(selected.phases[0].duration);
    setCycles(0);
    setRunning(true);
  }, [selected]);

  useEffect(() => {
    if (!running) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          const phases = selectedRef.current.phases;
          const next = (phaseIdxRef.current + 1) % phases.length;
          if (next === 0) setCycles((c) => c + 1);
          phaseIdxRef.current = next;
          setPhaseIdx(next);
          return phases[next].duration;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };
  }, [running]);

  const isInhale = phase?.label === "Inhale";
  const isHold = phase?.label === "Hold";
  const progress = running && phase ? 1 - (timeLeft / phase.duration) : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm px-4 py-3 flex items-center gap-3">
        <Link href="/" className="text-slate-400 hover:text-white transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
        <div>
          <h1 className="font-bold text-white">Breathing Exercises</h1>
          <p className="text-xs text-slate-500">Calm your nervous system in minutes</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8">
        {/* Exercise selector */}
        {!running && (
          <div className="space-y-3 mb-8">
            {EXERCISES.map((ex) => (
              <motion.button key={ex.id} onClick={() => setSelected(ex)}
                className={`w-full text-left rounded-2xl p-4 border transition-all ${selected.id === ex.id ? "border-teal-600 bg-teal-900/20" : "border-slate-800 bg-slate-900 hover:border-slate-700"}`}
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-white mb-0.5">{ex.name}</p>
                    <p className="text-xs text-slate-400 mb-1">{ex.subtitle}</p>
                    <p className="text-[11px] text-slate-500">{ex.benefit}</p>
                  </div>
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${ex.color} flex items-center justify-center shrink-0 ml-3 mt-1`}>
                    <span className="text-xs font-bold text-white">{ex.phases.length}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  {ex.phases.map((p, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-500">{p.label}</span>
                      <span className="text-[10px] font-bold text-white">{p.duration}s</span>
                      {i < ex.phases.length - 1 && <span className="text-slate-700">·</span>}
                    </div>
                  ))}
                </div>
              </motion.button>
            ))}
          </div>
        )}

        {/* Breathing animation */}
        <div className="flex flex-col items-center">
          <div className="relative flex items-center justify-center mb-8" style={{ width: 240, height: 240 }}>
            {/* Outer pulse rings */}
            {running && isInhale && (
              <>
                <div className={`absolute w-full h-full rounded-full ${selected.ring} opacity-10 animate-ping`} />
                <div className={`absolute w-3/4 h-3/4 rounded-full ${selected.ring} opacity-15`} style={{ animation: "ping 1.5s cubic-bezier(0,0,0.2,1) infinite 0.3s" }} />
              </>
            )}

            {/* Main breathing circle */}
            <motion.div
              className={`rounded-full bg-gradient-to-br ${selected.color} flex flex-col items-center justify-center shadow-2xl`}
              animate={running ? {
                width: isHold ? 180 : isInhale ? 220 : 140,
                height: isHold ? 180 : isInhale ? 220 : 140,
                opacity: isHold ? 0.85 : 1,
              } : { width: 160, height: 160 }}
              transition={{ duration: running && phase ? phase.duration * 0.9 : 0.5, ease: "easeInOut" }}
            >
              {running ? (
                <>
                  <p className="text-white/60 text-xs font-medium uppercase tracking-widest mb-1">{phase?.label}</p>
                  <p className="text-5xl font-black text-white">{timeLeft}</p>
                  <p className="text-white/60 text-[10px] mt-1 max-w-[100px] text-center leading-tight">{phase?.instruction}</p>
                </>
              ) : (
                <p className="text-white/80 text-sm font-medium">Ready</p>
              )}
            </motion.div>

            {/* Progress ring */}
            {running && (
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 240 240">
                <circle cx="120" cy="120" r="115" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                <circle cx="120" cy="120" r="115" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="4"
                  strokeDasharray={`${2 * Math.PI * 115}`}
                  strokeDashoffset={`${2 * Math.PI * 115 * (1 - progress)}`}
                  strokeLinecap="round"
                  style={{ transition: `stroke-dashoffset ${phase?.duration}s linear` }}
                />
              </svg>
            )}
          </div>

          {/* Cycle counter */}
          {running && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-slate-400 text-sm mb-6">
              {cycles === 0 ? "First cycle" : `${cycles} cycle${cycles > 1 ? "s" : ""} complete`} · {totalDuration}s each
            </motion.p>
          )}

          {/* Controls */}
          <div className="flex gap-3">
            {!running ? (
              <motion.button onClick={start} whileTap={{ scale: 0.95 }}
                className={`bg-gradient-to-r ${selected.color} text-white rounded-2xl px-8 py-4 font-semibold flex items-center gap-2 shadow-lg`}>
                <Play className="w-5 h-5" /> Begin {selected.name}
              </motion.button>
            ) : (
              <>
                <motion.button onClick={stop} whileTap={{ scale: 0.95 }}
                  className="bg-slate-700 hover:bg-slate-600 text-white rounded-2xl px-6 py-4 font-medium flex items-center gap-2">
                  <Pause className="w-5 h-5" /> Pause
                </motion.button>
                <motion.button onClick={() => { stop(); setTimeout(start, 100); }} whileTap={{ scale: 0.95 }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl px-5 py-4">
                  <RotateCcw className="w-5 h-5" />
                </motion.button>
              </>
            )}
          </div>

          {/* Science note */}
          <AnimatePresence>
            {!running && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="mt-8 bg-slate-900 border border-slate-800 rounded-xl p-4 text-center max-w-sm">
                <p className="text-xs text-slate-400 leading-relaxed">
                  <span className="text-teal-400 font-semibold">Why it works:</span> Slow exhalation activates the vagus nerve,
                  triggering your parasympathetic &quot;rest and digest&quot; system — the opposite of stress.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
