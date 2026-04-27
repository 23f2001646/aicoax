"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, PenLine, Sparkles, Trash2, ChevronDown } from "lucide-react";

interface JournalEntry {
  id: string;
  date: string;
  text: string;
  reflection: string;
  prompt: string;
}

const PROMPTS = [
  "What's weighing on your mind today?",
  "Describe a moment this week that made you feel something — good or bad.",
  "What are you avoiding, and why?",
  "What would you tell a friend who was feeling exactly how you feel right now?",
  "What do you need more of in your life right now?",
  "Write about something that went better than expected recently.",
  "What's one thing you're proud of yourself for, even if it feels small?",
  "When do you feel most like yourself?",
  "What boundaries do you need to set that you haven't yet?",
];

function getEntries(): JournalEntry[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem("aicoax_journal") || "[]"); } catch { return []; }
}

function saveEntry(entry: JournalEntry) {
  const entries = getEntries();
  entries.unshift(entry);
  localStorage.setItem("aicoax_journal", JSON.stringify(entries.slice(0, 50)));
}

function deleteEntry(id: string) {
  const entries = getEntries().filter((e) => e.id !== id);
  localStorage.setItem("aicoax_journal", JSON.stringify(entries));
}

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [text, setText] = useState("");
  const [prompt, setPrompt] = useState(PROMPTS[0]);
  const [reflection, setReflection] = useState("");
  const [reflecting, setReflecting] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [view, setView] = useState<"write" | "history">("write");

  useEffect(() => {
    setEntries(getEntries());
    setPrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
  }, []);

  const getReflection = async () => {
    if (!text.trim()) return;
    setReflecting(true);
    setReflection("");

    const res = await fetch("/api/journal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entry: text }),
    });
    if (!res.body) { setReflecting(false); return; }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let acc = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      acc += decoder.decode(value, { stream: true });
      setReflection(acc);
    }
    setReflecting(false);
  };

  const save = () => {
    if (!text.trim()) return;
    const entry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      text,
      reflection,
      prompt,
    };
    saveEntry(entry);
    setEntries(getEntries());
    setText("");
    setReflection("");
    setView("history");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-slate-400 hover:text-white transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
          <div>
            <h1 className="font-bold text-white">Journal</h1>
            <p className="text-xs text-slate-500">Write freely, reflect with AI</p>
          </div>
        </div>
        <div className="flex gap-1">
          {(["write", "history"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)}
              className={`text-xs px-3 py-1.5 rounded-lg capitalize transition-colors ${view === v ? "bg-slate-700 text-white" : "text-slate-500 hover:text-white"}`}>
              {v}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {view === "write" ? (
            <motion.div key="write" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-5">
              {/* Prompt */}
              <div className="bg-violet-900/20 border border-violet-700/30 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <PenLine className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-violet-400 font-medium mb-1">Today&apos;s prompt</p>
                    <p className="text-sm text-slate-300 italic">&quot;{prompt}&quot;</p>
                  </div>
                  <button onClick={() => setPrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)])}
                    className="text-violet-500 hover:text-violet-300 transition-colors text-xs">
                    ↻
                  </button>
                </div>
              </div>

              {/* Writing area */}
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Start writing... this is private, just for you."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 resize-none transition-colors leading-relaxed"
                rows={10}
              />

              <div className="flex gap-3">
                <button onClick={getReflection} disabled={!text.trim() || reflecting}
                  className="flex-1 bg-violet-700 hover:bg-violet-600 disabled:opacity-40 text-white rounded-xl py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2">
                  {reflecting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {reflecting ? "Reflecting..." : "Get AI Reflection"}
                </button>
                <button onClick={save} disabled={!text.trim()}
                  className="flex-1 bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white rounded-xl py-3 text-sm font-medium transition-colors">
                  Save Entry
                </button>
              </div>

              {/* AI Reflection */}
              <AnimatePresence>
                {reflection && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900 border border-slate-700 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-violet-400" />
                      <span className="text-xs font-medium text-violet-400">AiCoax insight</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">{reflection}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div key="history" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-3">
              {entries.length === 0 ? (
                <div className="text-center py-16">
                  <PenLine className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-600 text-sm">No entries yet.</p>
                  <button onClick={() => setView("write")} className="text-violet-400 text-sm mt-2 hover:underline">Write your first entry →</button>
                </div>
              ) : entries.map((e) => (
                <div key={e.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                  <button onClick={() => setExpanded(expanded === e.id ? null : e.id)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-800/50 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-white truncate max-w-[260px]">{e.text.slice(0, 60)}...</p>
                      <p className="text-xs text-slate-500">{new Date(e.date).toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" })}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={(ev) => { ev.stopPropagation(); deleteEntry(e.id); setEntries(getEntries()); }}
                        className="text-slate-600 hover:text-red-400 transition-colors p-1">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${expanded === e.id ? "rotate-180" : ""}`} />
                    </div>
                  </button>
                  {expanded === e.id && (
                    <div className="px-4 pb-4 border-t border-slate-800">
                      <p className="text-xs text-slate-500 italic mb-2 mt-3">&quot;{e.prompt}&quot;</p>
                      <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed mb-3">{e.text}</p>
                      {e.reflection && (
                        <div className="bg-violet-900/20 border border-violet-700/30 rounded-lg p-3">
                          <p className="text-xs text-violet-400 font-medium mb-1">AI Reflection</p>
                          <p className="text-xs text-slate-300 leading-relaxed">{e.reflection}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
