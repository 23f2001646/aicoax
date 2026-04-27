"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Mic, MicOff, RefreshCw, Volume2, VolumeX, Sparkles } from "lucide-react";
import MayaAvatar, { type MayaPose } from "@/components/MayaAvatar";

type Emotion = "neutral" | "happy" | "sad" | "excited" | "coaxing" | "thinking" | "blush" | "crying" | "laughing" | "angry";
interface Message { role: "user" | "assistant"; content: string; emotion?: Emotion; }

const GREETING = "Hi! I'm Maya. I'm here for you — whatever you need to talk through, I'm listening. 💙";

const LANGUAGES = [
  { code: "en", label: "English",    flag: "🇺🇸", ttsLang: "en-US" },
  { code: "hi", label: "हिंदी",      flag: "🇮🇳", ttsLang: "hi-IN" },
  { code: "ta", label: "தமிழ்",      flag: "🇮🇳", ttsLang: "ta-IN" },
  { code: "te", label: "తెలుగు",     flag: "🇮🇳", ttsLang: "te-IN" },
  { code: "bn", label: "বাংলা",      flag: "🇮🇳", ttsLang: "bn-IN" },
  { code: "mr", label: "मराठी",      flag: "🇮🇳", ttsLang: "mr-IN" },
  { code: "gu", label: "ગુજરાતી",    flag: "🇮🇳", ttsLang: "gu-IN" },
  { code: "kn", label: "ಕನ್ನಡ",      flag: "🇮🇳", ttsLang: "kn-IN" },
  { code: "ml", label: "മലയാളം",     flag: "🇮🇳", ttsLang: "ml-IN" },
  { code: "pa", label: "ਪੰਜਾਬੀ",     flag: "🇮🇳", ttsLang: "pa-IN" },
  { code: "es", label: "Español",    flag: "🇪🇸", ttsLang: "es-ES" },
  { code: "fr", label: "Français",   flag: "🇫🇷", ttsLang: "fr-FR" },
  { code: "de", label: "Deutsch",    flag: "🇩🇪", ttsLang: "de-DE" },
  { code: "ja", label: "日本語",      flag: "🇯🇵", ttsLang: "ja-JP" },
  { code: "ko", label: "한국어",      flag: "🇰🇷", ttsLang: "ko-KR" },
  { code: "zh", label: "中文",        flag: "🇨🇳", ttsLang: "zh-CN" },
  { code: "ar", label: "العربية",    flag: "🇸🇦", ttsLang: "ar-SA" },
  { code: "pt", label: "Português",  flag: "🇧🇷", ttsLang: "pt-BR" },
  { code: "ru", label: "Русский",    flag: "🇷🇺", ttsLang: "ru-RU" },
];

const MOODS = [
  { emoji: "😭", label: "I need to vent",      starter: "I really need to vent right now. So much has been going on and I feel completely overwhelmed.", color: "bg-blue-900/30 border-blue-700/40 hover:border-blue-500/60" },
  { emoji: "😤", label: "I'm frustrated",       starter: "I'm so frustrated and I don't even know where to start. Everything just feels wrong.", color: "bg-orange-900/30 border-orange-700/40 hover:border-orange-500/60" },
  { emoji: "💔", label: "I'm heartbroken",      starter: "I'm going through something really painful and I just need someone to talk to.", color: "bg-rose-900/30 border-rose-700/40 hover:border-rose-500/60" },
  { emoji: "😞", label: "I feel like giving up", starter: "I've been trying so hard but nothing is working out and I honestly feel like giving up.", color: "bg-indigo-900/30 border-indigo-700/40 hover:border-indigo-500/60" },
  { emoji: "🤯", label: "I'm so stressed",      starter: "The stress is just unreal right now. I feel like I can't catch a break.", color: "bg-yellow-900/30 border-yellow-700/40 hover:border-yellow-500/60" },
  { emoji: "🥺", label: "I feel alone",         starter: "I've been feeling really alone lately, like nobody really gets what I'm going through.", color: "bg-purple-900/30 border-purple-700/40 hover:border-purple-500/60" },
];

const HYPE = [
  { emoji: "💪", label: "Hype me up",   text: "I have something important coming up and I need you to hype me up!" },
  { emoji: "🎯", label: "Push me",      text: "I've been procrastinating and I need a real push to get going." },
  { emoji: "⭐", label: "I did a thing", text: "I just want to share something I did that I'm kinda proud of." },
];

const QUICK_REPLIES = [
  { label: "🫂 I need a hug",       text: "I just need a virtual hug right now" },
  { label: "💪 Hype me up",         text: "Okay I need you to hype me up, I can do this" },
  { label: "😤 I'm still upset",    text: "I'm still really upset about this" },
  { label: "🌱 What do I do now?",  text: "Okay what do I actually do now?" },
  { label: "🙏 Thanks Maya",        text: "Thank you, this genuinely helped me feel better" },
];

export default function FriendPage() {
  const [messages, setMessages]           = useState<Message[]>([]);
  const [input, setInput]                 = useState("");
  const [loading, setLoading]             = useState(false);
  const [listening, setListening]         = useState(false);
  const [showStarters, setShowStarters]   = useState(true);
  const [emotion, setEmotion]             = useState<Emotion>("neutral");
  const [speaking, setSpeaking]           = useState(false);
  const [voiceOn, setVoiceOn]             = useState(true);
  const [reaction, setReaction]           = useState<string | null>(null);
  const [pose, setPose]                   = useState<MayaPose>("standing");
  const [lang, setLang]                   = useState("en");
  const [showLangPicker, setShowLangPicker] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const bottomRef      = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLInputElement>(null);
  const hasGreetedRef  = useRef(false);

  // Load chat history
  useEffect(() => {
    try {
      const saved = localStorage.getItem("aicoax_maya");
      if (saved) {
        const parsed: Message[] = JSON.parse(saved);
        setMessages(parsed);
        if (parsed.length > 0) setShowStarters(false);
        const last = [...parsed].reverse().find(m => m.role === "assistant");
        if (last?.emotion) setEmotion(last.emotion);
      }
    } catch {}
    if (typeof window !== "undefined") window.speechSynthesis?.getVoices();
  }, []);

  // Auto-greeting: typewriter intro then sit down
  useEffect(() => {
    if (hasGreetedRef.current) return;
    hasGreetedRef.current = true;
    // Only greet on a fresh session (no saved history loaded yet)
    const hasSaved = !!localStorage.getItem("aicoax_maya");
    if (hasSaved) { setPose("sitting"); return; }

    let i = 0;
    setEmotion("happy");
    setSpeaking(true);
    setShowStarters(false);
    setMessages([{ role: "assistant", content: "", emotion: "happy" }]);

    const typewriter = setInterval(() => {
      i++;
      setMessages([{ role: "assistant", content: GREETING.slice(0, i), emotion: "happy" }]);
      if (i >= GREETING.length) {
        clearInterval(typewriter);
        setSpeaking(false);
        setTimeout(() => {
          setEmotion("neutral");
          setPose("sitting");
          setShowStarters(true);
        }, 900);
      }
    }, 32);

    return () => clearInterval(typewriter);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save chat history
  useEffect(() => {
    if (messages.length > 0) localStorage.setItem("aicoax_maya", JSON.stringify(messages.slice(-60)));
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const speak = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis || !voiceOn) return;
    window.speechSynthesis.cancel();

    // Split into sentences so each chunk feels natural with slight pauses
    const sentences = text.match(/[^.!?]+[.!?]?/g)?.filter(s => s.trim()) ?? [text];

    const voices = window.speechSynthesis.getVoices();

    // Pick TTS lang for current language setting
    const selectedTtsLang = LANGUAGES.find(l => l.code === lang)?.ttsLang ?? "en-US";
    // Try voices matching chosen language first, then sweet fallbacks
    const langVoice = voices.find(v => v.lang === selectedTtsLang && !v.name.toLowerCase().includes("male"))
                   ?? voices.find(v => v.lang.startsWith(selectedTtsLang.split("-")[0]) && !v.name.toLowerCase().includes("male"));

    // Sweet voice priority — Indian female first, then other warm female voices
    const sweetVoiceNames = [
      "Veena",                      // macOS — Indian English female ✨
      "Lekha",                      // macOS — Hindi female
      "Microsoft Heera",            // Windows — Indian English female
      "Microsoft Neerja",           // Windows — Hindi female
      "Google हिन्दी",              // Chrome Hindi female
      "Google Indian English Female",
      "hi-IN",                      // any hi-IN locale voice
      "en-IN",                      // any en-IN locale voice
      "Samantha",                   // macOS US — warm fallback
      "Karen",                      // macOS AU — soft
      "Moira",                      // macOS IE — melodic
      "Tessa",                      // macOS ZA — bright
      "Victoria",                   // macOS — smooth
      "Zira",                       // Windows
      "Google UK English Female",
      "Google US English Female",
      "Microsoft Zira",
      "Female",
    ];

    const chosenVoice =
      // 0. exact lang-matched voice (highest priority)
      langVoice ??
      // 1. match by name / locale keyword
      sweetVoiceNames.reduce<SpeechSynthesisVoice | null>((found, name) => {
        if (found) return found;
        return (
          voices.find(v => v.name.includes(name)) ??
          voices.find(v => v.lang.startsWith(name)) ?? // catches "hi-IN", "en-IN"
          null
        );
      }, null) ??
      // 2. any Indian-locale voice
      voices.find(v => v.lang === "en-IN" || v.lang === "hi-IN") ??
      // 3. any female-labelled voice
      voices.find(v => v.name.toLowerCase().includes("female")) ??
      voices.find(v => !v.name.toLowerCase().includes("male")) ??
      null;

    let index = 0;
    setSpeaking(true);

    const speakNext = () => {
      if (index >= sentences.length) { setSpeaking(false); return; }
      const chunk = sentences[index++].trim();
      if (!chunk) { speakNext(); return; }

      const u = new SpeechSynthesisUtterance(chunk);
      const ttsLang = LANGUAGES.find(l => l.code === lang)?.ttsLang ?? "en-US";
      const isIndian = ttsLang.endsWith("-IN");
      u.lang   = ttsLang;
      u.rate   = isIndian ? 0.9  : 0.88;
      u.pitch  = isIndian ? 1.25 : 1.35;
      u.volume = 1;
      if (chosenVoice) u.voice = chosenVoice;

      // Tiny pitch variation per sentence makes it feel alive
      if (chunk.endsWith("?"))      u.pitch = 1.45;
      else if (chunk.endsWith("!")) u.pitch = 1.4;
      else                          u.pitch = 1.3 + Math.random() * 0.1;

      u.onend   = speakNext;
      u.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(u);
    };

    speakNext();
  };

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    setShowStarters(false);
    window.speechSynthesis?.cancel();
    setSpeaking(false);

    const apiMsgs = messages.map(m => ({ role: m.role, content: m.content }));
    apiMsgs.push({ role: "user", content: text });

    setMessages(prev => [...prev, { role: "user", content: text }]);
    setInput("");

    // Floating reaction
    const REACTIONS = ["✨","💙","🤝","💫","🫂","💪","🌊","🌟"];
    setReaction(REACTIONS[Math.floor(Math.random() * REACTIONS.length)]);
    setTimeout(() => setReaction(null), 1400);

    setLoading(true);
    const res = await fetch("/api/friend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: apiMsgs, lang }),
    });
    if (!res.body) { setLoading(false); return; }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let acc = "";
    let detectedEmotion: Emotion = "neutral";
    let displayText = "";

    setMessages(prev => [...prev, { role: "assistant", content: "", emotion: "neutral" }]);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      acc += decoder.decode(value, { stream: true });

      // Strip emotion tag
      const match = acc.match(/^\[(neutral|happy|sad|excited|coaxing|thinking|blush|crying|laughing|angry)\]\s*/i);
      if (match) {
        detectedEmotion = match[1].toLowerCase() as Emotion;
        setEmotion(detectedEmotion);
        displayText = acc.slice(match[0].length);
      } else {
        displayText = acc;
      }

      setMessages(prev => {
        const u = [...prev];
        u[u.length - 1] = { role: "assistant", content: displayText, emotion: detectedEmotion };
        return u;
      });
    }

    setLoading(false);
    setPose("sitting");
    speak(displayText);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const toggleMic = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) return;
    if (listening) { recognitionRef.current?.stop(); setListening(false); return; }
    const r = new SR();
    r.lang = LANGUAGES.find(l => l.code === lang)?.ttsLang ?? "en-US";
    r.interimResults = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    r.onresult = (e: any) => setInput(p => p ? p + " " + e.results[0][0].transcript : e.results[0][0].transcript);
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    recognitionRef.current = r; r.start(); setListening(true);
  };

  const reset = () => {
    window.speechSynthesis?.cancel();
    setMessages([]); setShowStarters(true);
    setEmotion("neutral"); setSpeaking(false);
    localStorage.removeItem("aicoax_maya");
  };

  const toggleVoice = () => {
    if (voiceOn) window.speechSynthesis?.cancel();
    setSpeaking(false); setVoiceOn(v => !v);
  };

  const hasChat = messages.length > 0;

  return (
    <div className="flex flex-col h-screen bg-slate-950 overflow-hidden">
      {/* Header */}
      <header className="shrink-0 px-4 py-3 border-b border-slate-800/60 bg-slate-900/70 backdrop-blur-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-slate-500 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-bold text-white leading-none">Maya</h1>
            <p className="text-[10px] text-green-400">● Online · AI companion</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Language picker */}
          <div className="relative">
            <button
              onClick={() => setShowLangPicker(v => !v)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors text-xs font-medium text-slate-300"
            >
              <span className="text-sm">{LANGUAGES.find(l => l.code === lang)?.flag}</span>
              <span>{LANGUAGES.find(l => l.code === lang)?.label}</span>
              <span className="text-slate-500 text-[10px]">▾</span>
            </button>

            <AnimatePresence>
              {showLangPicker && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0,  scale: 1 }}
                  exit   ={{ opacity: 0, y: -6, scale: 0.95 }}
                  className="absolute right-0 top-10 z-50 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 w-52 max-h-72 overflow-y-auto"
                >
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide px-2 mb-1.5">Maya speaks in…</p>
                  {LANGUAGES.map(l => (
                    <button key={l.code}
                      onClick={() => { setLang(l.code); setShowLangPicker(false); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors ${
                        lang === l.code
                          ? "bg-teal-900/50 text-teal-300 border border-teal-700/40"
                          : "text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      <span className="text-base">{l.flag}</span>
                      <span className="font-medium">{l.label}</span>
                      {lang === l.code && <span className="ml-auto text-teal-400 text-xs">✓</span>}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button onClick={toggleVoice} title={voiceOn ? "Mute Maya" : "Unmute Maya"}
            className={`p-2 rounded-lg transition-colors ${voiceOn ? "text-teal-400 hover:bg-slate-800" : "text-slate-600 hover:bg-slate-800"}`}>
            {voiceOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          {hasChat && (
            <button onClick={reset} className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Maya avatar section */}
      <div className={`shrink-0 flex flex-col items-center justify-center py-5 transition-all duration-500 ${hasChat ? "py-3" : "py-8"}`}>
        <MayaAvatar emotion={emotion} speaking={speaking} pose={pose} size={hasChat ? 110 : 170} />
        {!hasChat && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="mt-4 text-center">
            <p className="text-white font-semibold text-lg">Hi, I&apos;m Maya 🧡</p>
            <p className="text-slate-400 text-sm mt-1 max-w-xs mx-auto">Your AI best friend. Here to listen, console, and hype you up — for real.</p>
          </motion.div>
        )}
      </div>

      {/* Chat or starters */}
      <div className="flex-1 overflow-y-auto px-4 pb-2">
        {showStarters && !hasChat ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto space-y-5">
            {/* Opening message from Maya */}
            <div className="flex gap-2 items-end">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center text-sm shrink-0">🧡</div>
              <div className="bg-slate-800 rounded-2xl rounded-bl-sm px-4 py-3 max-w-xs">
                <p className="text-sm text-white leading-relaxed">what&apos;s going on? I&apos;m all ears 💙 pick one or just type it out</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {MOODS.map((m, i) => (
                <motion.button key={i}
                  initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                  onClick={() => send(m.starter)} whileTap={{ scale: 0.96 }}
                  className={`text-left rounded-2xl p-3.5 border transition-all ${m.color}`}>
                  <span className="text-xl block mb-1">{m.emoji}</span>
                  <span className="text-sm text-white font-medium">{m.label}</span>
                </motion.button>
              ))}
            </div>

            <div className="space-y-2 pt-1">
              {HYPE.map((h, i) => (
                <motion.button key={i}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + i * 0.07 }}
                  onClick={() => send(h.text)}
                  className="w-full text-left bg-slate-900 border border-slate-700 hover:border-pink-600/50 hover:bg-slate-800 rounded-xl px-4 py-3 transition-all flex items-center gap-3">
                  <span className="text-xl">{h.emoji}</span>
                  <span className="text-sm text-slate-300">{h.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-3">
            {messages.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                className={`flex gap-2 items-end ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center text-sm shrink-0 shadow-md">🧡</div>
                )}
                <div className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-gradient-to-br from-pink-600 to-rose-600 text-white rounded-br-sm"
                    : "bg-slate-800 text-slate-100 rounded-bl-sm"
                }`}>
                  {m.content || (
                    <div className="flex gap-1 py-1 items-center">
                      {[0,150,300].map(d => <span key={d} className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
                    </div>
                  )}
                </div>
                {m.role === "user" && (
                  <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-sm shrink-0">😊</div>
                )}
              </motion.div>
            ))}
            {loading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex gap-2 items-end">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center text-sm shrink-0">🧡</div>
                <div className="bg-slate-800 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
                  {[0,150,300].map(d => <span key={d} className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Floating reaction */}
      <AnimatePresence>
        {reaction && (
          <motion.div initial={{ opacity: 0, scale: 0.5, y: 0 }} animate={{ opacity: 1, scale: 1.8, y: -50 }}
            exit={{ opacity: 0, y: -100 }} transition={{ duration: 0.9 }}
            className="fixed bottom-28 left-1/2 -translate-x-1/2 text-2xl pointer-events-none z-50">
            {reaction}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick replies mid-chat */}
      {hasChat && !loading && (
        <div className="shrink-0 px-4 py-2 flex gap-2 overflow-x-auto border-t border-slate-800/50 scrollbar-none">
          {QUICK_REPLIES.map((q, i) => (
            <button key={i} onClick={() => send(q.text)}
              className="shrink-0 text-xs text-slate-300 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 hover:border-pink-600/40 rounded-full px-3 py-1.5 transition-all whitespace-nowrap">
              {q.label}
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div className="shrink-0 px-4 pb-5 pt-2 bg-slate-900/60 border-t border-slate-800 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto flex gap-2 items-center">
          <input ref={inputRef}
            className="flex-1 bg-slate-800/80 border border-slate-700 rounded-2xl pl-4 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-pink-500/60 transition-colors"
            placeholder="just talk to me 💙"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
            disabled={loading}
          />
          <button onClick={toggleMic} disabled={loading}
            className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              listening ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-900/50" : "bg-slate-700 hover:bg-slate-600 text-slate-300"
            }`}>
            {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
          <button onClick={() => send(input)} disabled={loading || !input.trim()}
            className="shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 disabled:opacity-40 text-white flex items-center justify-center transition-all shadow-lg shadow-pink-900/40">
            {loading
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Send className="w-4 h-4" />}
          </button>
        </div>
        {!hasChat && (
          <p className="text-center text-[10px] text-slate-700 mt-2 flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3" />
            Maya is an AI — not a real person · crisis help:
            <Link href="/crisis" className="underline text-slate-600">iCall 9152987821</Link>
          </p>
        )}
      </div>
    </div>
  );
}
