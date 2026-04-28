"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/components/AppProviders";
import MayaAvatar from "@/components/MayaAvatar";

const REASONS = [
  { id: "anxiety",    emoji: "😰", label: "Anxiety & worry",        desc: "Racing thoughts, overthinking" },
  { id: "burnout",    emoji: "🔥", label: "Burnout & stress",        desc: "Exhausted, can't switch off" },
  { id: "grief",      emoji: "💔", label: "Grief & loss",            desc: "Processing something painful" },
  { id: "loneliness", emoji: "🥺", label: "Loneliness",              desc: "Feeling disconnected" },
  { id: "growth",     emoji: "🌱", label: "Personal growth",         desc: "Better habits, self-awareness" },
  { id: "stress",     emoji: "😤", label: "Work / study stress",     desc: "Deadlines, pressure, overwhelm" },
  { id: "other",      emoji: "✨", label: "Just exploring",          desc: "Curious to see what this is" },
];

const TONES = [
  { value: "gentle",       emoji: "🌸", label: "Gentle",       desc: "Soft and nurturing" },
  { value: "direct",       emoji: "🎯", label: "Direct",       desc: "Real talk, no fluff" },
  { value: "fun",          emoji: "✨", label: "Fun",          desc: "Playful and upbeat" },
  { value: "motivational", emoji: "🔥", label: "Motivational", desc: "Energetic, hype you up" },
];

const MOOD_OPTS = [
  { val: 1, emoji: "😞", label: "Really low" },
  { val: 2, emoji: "😔", label: "Not great" },
  { val: 3, emoji: "😐", label: "Okay" },
  { val: 4, emoji: "🙂", label: "Pretty good" },
  { val: 5, emoji: "😊", label: "Great" },
];

const MAYA_INTROS: Record<string, string> = {
  anxiety:    "anxiety and worry",
  burnout:    "burnout and stress",
  grief:      "grief and loss",
  loneliness: "loneliness",
  growth:     "personal growth",
  stress:     "work and study stress",
  other:      "exploring how you're doing",
};

type Step = "welcome" | "name" | "reason" | "mood" | "tone" | "notify" | "meet";

export default function OnboardingPage() {
  const { user, updatePrefs } = useApp();
  const router = useRouter();
  const [step, setStep] = useState<Step>("welcome");
  const [name, setName]         = useState("");
  const [reason, setReason]     = useState("");
  const [mood, setMood]         = useState(3);
  const [tone, setTone]         = useState<"gentle"|"direct"|"fun"|"motivational">("gentle");
  const [notifyTime, setNotify] = useState("08:00");
  const [mayaMsg, setMayaMsg]   = useState("");
  const [typing, setTyping]     = useState(false);
  const [notifyEnabled, setNotifyEnabled] = useState(false);

  useEffect(() => {
    if (step === "meet") generateMayaIntro();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  async function generateMayaIntro() {
    setTyping(true);
    const displayName = name || user?.name?.split(" ")[0] || "friend";
    const reasonLabel = MAYA_INTROS[reason] || "how you're feeling";
    const moodLabel   = MOOD_OPTS.find(m => m.val === mood)?.label ?? "okay";

    const prompt = `You are Maya, a warm AI best friend. Generate a short (3-4 sentence), deeply personal, emoji-filled first message to ${displayName}. They came to you for help with ${reasonLabel}. They said they're feeling "${moodLabel}" right now. Their preferred tone is ${tone}.

Start with a warm greeting using their name. Acknowledge how they're feeling without being clinical. End with ONE gentle question to get them talking. Make it feel like a real friend, not a bot. No bullet points. Keep it conversational and real.`;

    try {
      const res = await fetch("/api/companion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: prompt }] }),
      });
      if (!res.body) { setMayaMsg("Hey! I'm so glad you're here. Tell me — what's been going on? 💙"); setTyping(false); return; }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMayaMsg(acc);
      }
    } catch {
      setMayaMsg(`Hey ${displayName}! I'm so glad you're here. Tell me — what's going on? 💙`);
    }
    setTyping(false);
  }

  async function finish() {
    updatePrefs({
      mayaCallsMe: name,
      mayaTone: tone,
      onboardingDone: true,
      onboardingReason: reason,
      onboardingMood: mood,
      notifyTime: notifyEnabled ? notifyTime : undefined,
    });

    // Request notification permission
    if (notifyEnabled && typeof window !== "undefined" && "Notification" in window) {
      await Notification.requestPermission();
    }

    // Store Maya's first message so friend page shows it
    if (mayaMsg && user) {
      const key = `aicoax_maya_${user.id}_firstmsg`;
      localStorage.setItem(key, mayaMsg);
    }

    router.replace("/friend");
  }

  const slide = { initial: { opacity: 0, x: 40 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -40 } };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-slate-950">
      {/* Progress dots */}
      <div className="flex gap-2 mb-8">
        {(["welcome","name","reason","mood","tone","notify","meet"] as Step[]).map((s, i) => (
          <div key={s} className={`h-1.5 rounded-full transition-all duration-300 ${
            s === step ? "w-8 bg-teal-400" : (["welcome","name","reason","mood","tone","notify","meet"].indexOf(step) > i ? "w-4 bg-teal-700" : "w-4 bg-slate-700")
          }`} />
        ))}
      </div>

      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">

          {/* WELCOME */}
          {step === "welcome" && (
            <motion.div key="welcome" {...slide} className="text-center space-y-6">
              <div className="flex justify-center">
                <MayaAvatar emotion="happy" speaking={false} pose="standing" size={180} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Hi, I&apos;m Maya 🧡</h1>
                <p className="text-slate-400 mt-3 leading-relaxed">
                  Your AI best friend — here to listen, support, and keep it real. Let me get to know you a little so I can actually be there for you.
                </p>
              </div>
              <button onClick={() => setStep("name")}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-2xl py-4 font-semibold text-lg hover:opacity-90 transition-opacity">
                Let&apos;s go →
              </button>
              <p className="text-slate-600 text-xs">Takes about 1 minute · All private</p>
            </motion.div>
          )}

          {/* NAME */}
          {step === "name" && (
            <motion.div key="name" {...slide} className="space-y-6">
              <div className="text-center">
                <div className="text-4xl mb-3">👋</div>
                <h2 className="text-2xl font-bold text-white">What should I call you?</h2>
                <p className="text-slate-400 text-sm mt-2">I&apos;ll use this in our chats to make it personal</p>
              </div>
              <input
                type="text"
                autoFocus
                placeholder={user?.name?.split(" ")[0] ?? "Your first name"}
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && setStep("reason")}
                className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-5 py-4 text-white text-lg placeholder-slate-600 focus:outline-none focus:border-teal-500 transition-colors text-center"
              />
              <div className="flex gap-3">
                <button onClick={() => setStep("welcome")} className="flex-1 py-3 rounded-2xl border border-slate-700 text-slate-400 hover:text-white transition-colors">← Back</button>
                <button onClick={() => setStep("reason")} className="flex-2 flex-1 py-3 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-medium transition-colors">
                  {name ? `Nice to meet you, ${name}! →` : "Skip →"}
                </button>
              </div>
            </motion.div>
          )}

          {/* REASON */}
          {step === "reason" && (
            <motion.div key="reason" {...slide} className="space-y-5">
              <div className="text-center">
                <div className="text-4xl mb-3">💭</div>
                <h2 className="text-2xl font-bold text-white">What brings you here?</h2>
                <p className="text-slate-400 text-sm mt-2">I&apos;ll personalise how I support you</p>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {REASONS.map(r => (
                  <button key={r.id} onClick={() => { setReason(r.id); setStep("mood"); }}
                    className={`flex items-center gap-4 p-4 rounded-2xl border text-left transition-all ${
                      reason === r.id ? "border-teal-500 bg-teal-500/10" : "border-slate-800 bg-slate-900 hover:border-slate-600"
                    }`}>
                    <span className="text-2xl">{r.emoji}</span>
                    <div>
                      <p className="text-white font-medium">{r.label}</p>
                      <p className="text-slate-500 text-xs">{r.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
              <button onClick={() => setStep("welcome")} className="w-full py-2 text-slate-500 hover:text-slate-300 transition-colors text-sm">← Back</button>
            </motion.div>
          )}

          {/* MOOD */}
          {step === "mood" && (
            <motion.div key="mood" {...slide} className="space-y-6">
              <div className="text-center">
                <div className="text-4xl mb-3">🌡️</div>
                <h2 className="text-2xl font-bold text-white">How are you feeling right now?</h2>
                <p className="text-slate-400 text-sm mt-2">Be honest — no judgment here</p>
              </div>
              <div className="flex justify-between gap-2">
                {MOOD_OPTS.map(m => (
                  <button key={m.val} onClick={() => setMood(m.val)}
                    className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${
                      mood === m.val ? "border-teal-500 bg-teal-500/10 scale-105" : "border-slate-800 bg-slate-900 hover:border-slate-600"
                    }`}>
                    <span className="text-2xl">{m.emoji}</span>
                    <span className="text-[10px] text-slate-400">{m.label}</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep("reason")} className="flex-1 py-3 rounded-2xl border border-slate-700 text-slate-400 hover:text-white transition-colors">← Back</button>
                <button onClick={() => setStep("tone")} className="flex-1 py-3 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-medium transition-colors">Next →</button>
              </div>
            </motion.div>
          )}

          {/* TONE */}
          {step === "tone" && (
            <motion.div key="tone" {...slide} className="space-y-5">
              <div className="text-center">
                <div className="text-4xl mb-3">🎭</div>
                <h2 className="text-2xl font-bold text-white">How should I talk to you?</h2>
                <p className="text-slate-400 text-sm mt-2">You can change this any time in settings</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {TONES.map(t => (
                  <button key={t.value} onClick={() => setTone(t.value as typeof tone)}
                    className={`flex flex-col items-center gap-2 p-5 rounded-2xl border transition-all ${
                      tone === t.value ? "border-teal-500 bg-teal-500/10" : "border-slate-800 bg-slate-900 hover:border-slate-600"
                    }`}>
                    <span className="text-3xl">{t.emoji}</span>
                    <p className="text-white font-semibold">{t.label}</p>
                    <p className="text-slate-500 text-xs text-center">{t.desc}</p>
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep("mood")} className="flex-1 py-3 rounded-2xl border border-slate-700 text-slate-400 hover:text-white transition-colors">← Back</button>
                <button onClick={() => setStep("notify")} className="flex-1 py-3 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-medium transition-colors">Next →</button>
              </div>
            </motion.div>
          )}

          {/* NOTIFICATIONS */}
          {step === "notify" && (
            <motion.div key="notify" {...slide} className="space-y-6">
              <div className="text-center">
                <div className="text-4xl mb-3">🔔</div>
                <h2 className="text-2xl font-bold text-white">Daily check-in reminder?</h2>
                <p className="text-slate-400 text-sm mt-2">I&apos;ll nudge you once a day to log your mood</p>
              </div>
              <div className="space-y-3">
                <button onClick={() => setNotifyEnabled(v => !v)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                    notifyEnabled ? "border-teal-500 bg-teal-500/10" : "border-slate-800 bg-slate-900 hover:border-slate-600"
                  }`}>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${notifyEnabled ? "border-teal-500 bg-teal-500" : "border-slate-600"}`}>
                    {notifyEnabled && <span className="text-white text-xs">✓</span>}
                  </div>
                  <div className="text-left">
                    <p className="text-white font-medium">Yes, remind me daily</p>
                    <p className="text-slate-500 text-xs">Browser notification at your chosen time</p>
                  </div>
                </button>
                {notifyEnabled && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                    <label className="text-slate-400 text-sm block mb-2">What time?</label>
                    <input type="time" value={notifyTime} onChange={e => setNotify(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 transition-colors" />
                  </motion.div>
                )}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep("tone")} className="flex-1 py-3 rounded-2xl border border-slate-700 text-slate-400 hover:text-white transition-colors">← Back</button>
                <button onClick={() => setStep("meet")} className="flex-1 py-3 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-medium transition-colors">Meet Maya →</button>
              </div>
            </motion.div>
          )}

          {/* MEET MAYA */}
          {step === "meet" && (
            <motion.div key="meet" {...slide} className="space-y-6 text-center">
              <div className="flex justify-center">
                <MayaAvatar emotion={typing ? "thinking" : "happy"} speaking={typing} pose="standing" size={160} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">
                  {name ? `${name}, meet Maya 🧡` : "Meet Maya 🧡"}
                </h2>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-left min-h-[100px]">
                  {typing && !mayaMsg ? (
                    <div className="flex gap-1 items-center py-2">
                      {[0,150,300].map(d => <span key={d} className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
                    </div>
                  ) : (
                    <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">{mayaMsg}</p>
                  )}
                </div>
              </div>
              {!typing && mayaMsg && (
                <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  onClick={finish}
                  className="w-full bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-2xl py-4 font-semibold text-lg hover:opacity-90 transition-opacity">
                  Start talking to Maya 💙
                </motion.button>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
