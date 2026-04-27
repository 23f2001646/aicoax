"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Wind, Brain, TrendingDown, AlertTriangle, BookOpen, Send, Mic, MicOff, Sparkles, PenLine, LayoutDashboard } from "lucide-react";
import { saveMood, getTodayMood } from "@/lib/mood";

interface Message { role: "user" | "assistant"; content: string; }

const MOODS = [
  { score: 1, emoji: "😔", label: "Very low" },
  { score: 3, emoji: "😞", label: "Low" },
  { score: 5, emoji: "😐", label: "Okay" },
  { score: 7, emoji: "🙂", label: "Good" },
  { score: 9, emoji: "😊", label: "Great" },
];

const STARTERS = [
  "I've been feeling really anxious lately and I don't know why",
  "Work has been overwhelming me and I can't switch off",
  "I feel empty and unmotivated, like nothing matters",
  "I keep having negative thoughts I can't stop",
  "I'm struggling to sleep because of stress",
];

const NAV = [
  { href: "/dashboard", icon: <LayoutDashboard className="w-5 h-5" />, label: "Dashboard", color: "text-teal-400" },
  { href: "/friend", icon: <span className="text-lg leading-none">🧡</span>, label: "Maya", color: "text-pink-400" },
  { href: "/breathe", icon: <Wind className="w-5 h-5" />, label: "Breathe", color: "text-cyan-400" },
  { href: "/understand", icon: <BookOpen className="w-5 h-5" />, label: "Learn", color: "text-violet-400" },
  { href: "/mood", icon: <Heart className="w-5 h-5" />, label: "Mood", color: "text-rose-400" },
  { href: "/cbt", icon: <Brain className="w-5 h-5" />, label: "CBT", color: "text-amber-400" },
  { href: "/burnout", icon: <TrendingDown className="w-5 h-5" />, label: "Burnout", color: "text-orange-400" },
  { href: "/journal", icon: <PenLine className="w-5 h-5" />, label: "Journal", color: "text-violet-400" },
  { href: "/crisis", icon: <AlertTriangle className="w-5 h-5" />, label: "Help", color: "text-red-400" },
];

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [moodSet, setMoodSet] = useState(false);
  const [listening, setListening] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    try {
      const saved = localStorage.getItem("aicoax_chat_main");
      if (saved) setMessages(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("aicoax_chat_main", JSON.stringify(messages));
    }
  }, [messages]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const today = getTodayMood();
    if (today) setMoodSet(true);
  }, []);

  const submitMood = (score: number) => {
    setMoodSet(true);
    saveMood({ date: new Date().toISOString(), score, emotion: MOODS.find(m => m.score === score)?.label || "", note: "" });
  };

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const newMsgs: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMsgs);
    setInput("");
    setLoading(true);

    const res = await fetch("/api/companion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: newMsgs }),
    });
    if (!res.body) { setLoading(false); return; }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let acc = "";
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      acc += decoder.decode(value, { stream: true });
      setMessages((prev) => { const u = [...prev]; u[u.length - 1] = { role: "assistant", content: acc }; return u; });
    }
    setLoading(false);
  };

  const toggleVoice = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) return;
    if (listening) { recognitionRef.current?.stop(); setListening(false); return; }
    const r = new SR();
    r.lang = "en-US";
    r.interimResults = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    r.onresult = (e: any) => setInput((prev) => prev ? prev + " " + e.results[0][0].transcript : e.results[0][0].transcript);
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    recognitionRef.current = r;
    r.start();
    setListening(true);
  };

  const hasChat = messages.length > 0;

  return (
    <div className="flex flex-col h-screen bg-slate-950">
      {/* Header */}
      <header className="shrink-0 px-4 py-3 border-b border-slate-800/60 bg-slate-900/60 backdrop-blur-sm flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" fill="white" />
            </div>
            <div className="absolute inset-0 rounded-xl bg-teal-400/20 animate-ping" />
          </div>
          <div>
            <h1 className="font-bold text-white text-sm leading-none">AiCoax</h1>
            <p className="text-[10px] text-slate-500">AI Companion · Not a therapist</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {NAV.slice(0, 4).map((n) => (
            <Link key={n.href} href={n.href} className={`hidden md:flex items-center gap-1.5 text-xs ${n.color} hover:text-white transition-colors px-2 py-1.5 rounded-lg hover:bg-slate-800`}>
              {n.icon}<span className="hidden lg:inline text-[11px]">{n.label}</span>
            </Link>
          ))}
          <Link href="/crisis" className="text-xs text-red-400 hover:text-red-300 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-red-900/20 border border-red-800/40 ml-1 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /><span className="hidden md:inline text-[11px]">Crisis Help</span>
          </Link>
        </div>
      </header>

      {/* Daily mood check-in */}
      <AnimatePresence>
        {!moodSet && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="shrink-0 bg-gradient-to-r from-teal-900/20 to-cyan-900/20 border-b border-teal-800/30 px-4 py-3 overflow-hidden"
          >
            <p className="text-sm text-slate-300 mb-2.5 font-medium">How are you feeling right now?</p>
            <div className="flex gap-2">
              {MOODS.map((m) => (
                <button key={m.score} onClick={() => submitMood(m.score)}
                  className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl hover:bg-slate-800 transition-colors group">
                  <span className="text-xl group-hover:scale-125 transition-transform">{m.emoji}</span>
                  <span className="text-[10px] text-slate-500 group-hover:text-slate-300">{m.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {isClient && !hasChat ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto pt-6">
            <div className="text-center mb-8">
              <div className="relative inline-flex mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center float shadow-xl shadow-teal-900/40">
                  <Heart className="w-8 h-8 text-white" fill="white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Hi, I&apos;m AiCoax</h2>
              <p className="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto">
                A safe space to talk through what you&apos;re feeling. I listen without judgment,
                help you understand your mind, and share evidence-based coping tools.
              </p>
              <p className="text-xs text-slate-600 mt-2 italic">I&apos;m an AI — not a therapist or crisis service</p>
            </div>

            {/* Maya featured card */}
            <Link href="/friend"
              className="block bg-gradient-to-br from-pink-900/40 via-rose-900/30 to-orange-900/30 border border-pink-700/40 rounded-2xl p-4 mb-4 hover:border-pink-500/60 transition-all group">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center text-xl shadow-lg shadow-pink-900/40 group-hover:scale-105 transition-transform">
                    🧡
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-950" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-bold text-white">Talk to Maya</p>
                    <span className="text-[10px] bg-pink-900/50 border border-pink-700/50 text-pink-300 px-2 py-0.5 rounded-full">New ✨</span>
                  </div>
                  <p className="text-xs text-slate-400">Your AI best friend — consoles, motivates, and keeps it real 💙</p>
                </div>
                <span className="text-pink-400 text-xl group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>

            {/* Quick tools grid */}
            <div className="grid grid-cols-4 gap-2 mb-8">
              {NAV.filter(n => n.href !== "/friend").map((n) => (
                <Link key={n.href} href={n.href}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col items-center gap-1.5 hover:border-slate-600 transition-all group hover:bg-slate-800/50">
                  <span className={`${n.color} group-hover:scale-110 transition-transform`}>{n.icon}</span>
                  <span className="text-[10px] text-slate-400 group-hover:text-white transition-colors">{n.label}</span>
                </Link>
              ))}
            </div>

            <p className="text-[11px] text-slate-600 mb-3 text-center uppercase tracking-widest">Or share what&apos;s on your mind</p>
            <div className="space-y-2">
              {STARTERS.map((s, i) => (
                <motion.button key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                  onClick={() => send(s)}
                  className="w-full text-left text-sm text-slate-400 hover:text-white bg-slate-900/50 hover:bg-slate-800 border border-slate-800 hover:border-teal-700/50 rounded-xl px-4 py-3 transition-all flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-teal-500 shrink-0" />{s}
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : isClient ? (
          <div className="max-w-2xl mx-auto space-y-4">
            {messages.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} gap-2`}>
                {m.role === "assistant" && (
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shrink-0 mt-1 shadow-lg shadow-teal-900/40">
                    <Heart className="w-3.5 h-3.5 text-white" fill="white" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-teal-600 text-white rounded-tr-sm"
                    : "bg-slate-800 text-slate-200 rounded-tl-sm"
                }`}>
                  {m.content}
                </div>
              </motion.div>
            ))}
            {loading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex justify-start gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shrink-0">
                  <Heart className="w-3.5 h-3.5 text-white" fill="white" />
                </div>
                <div className="bg-slate-800 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1 items-center">
                  {[0, 150, 300].map((d) => (
                    <span key={d} className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        ) : null}
      </div>

      {/* Ethics strip */}
      <div className="shrink-0 px-4 py-1.5 bg-amber-950/30 border-t border-amber-900/30">
        <p className="text-[10px] text-amber-700/70 text-center">
          AI companion only · Crisis help: <span className="underline cursor-pointer">iCall 9152987821</span> · <span className="underline cursor-pointer">Vandrevala 1860-2662-345</span> · <Link href="/crisis" className="underline">More resources →</Link>
        </p>
      </div>

      {/* Input */}
      <div className="shrink-0 px-4 pb-4 pt-2 border-t border-slate-800 bg-slate-900/50">
        <div className="max-w-2xl mx-auto flex gap-2">
          <input
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
            placeholder="Tell me what's on your mind..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
            disabled={loading}
            autoFocus
          />
          <button onClick={toggleVoice} disabled={loading}
            title={listening ? "Stop" : "Voice input"}
            className={`shrink-0 rounded-xl px-3 py-3 transition-colors ${listening ? "bg-red-600 text-white animate-pulse" : "bg-slate-700 hover:bg-slate-600 text-slate-300"}`}>
            {listening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          <button onClick={() => send(input)} disabled={loading || !input.trim()}
            className="bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white rounded-xl px-4 py-3 transition-colors shrink-0">
            {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin block" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden shrink-0 bg-slate-900/95 backdrop-blur border-t border-slate-800 flex items-center justify-around px-2 py-2">
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-colors hover:bg-slate-800">
            <span className={n.color}>{n.icon}</span>
            <span className="text-[10px] font-medium text-slate-500">{n.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
