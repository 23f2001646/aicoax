"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Mic, MicOff, RefreshCw, Volume2, VolumeX, Sparkles, Phone, PhoneOff } from "lucide-react";
import MayaAvatar, { type MayaPose } from "@/components/MayaAvatar";
import { useApp } from "@/components/AppProviders";
import { uKey } from "@/lib/auth";

type Emotion = "neutral" | "happy" | "sad" | "excited" | "coaxing" | "thinking" | "blush" | "crying" | "laughing" | "angry" | "hug";
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
  const { user, prefs } = useApp();
  const chatKey = user ? uKey(user.id, "maya") : "aicoax_maya_guest";
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
  const [voiceMode, setVoiceMode]           = useState(false); // full-screen voice call mode
  const voiceModeRef = useRef(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const bottomRef      = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLInputElement>(null);
  const hasGreetedRef  = useRef(false);
  const [playGreeting, setPlayGreeting] = useState(false);

  // Load chat history (per-user)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(chatKey);
      if (saved) {
        const parsed: Message[] = JSON.parse(saved);
        setMessages(parsed);
        if (parsed.length > 0) setShowStarters(false);
        const last = [...parsed].reverse().find(m => m.role === "assistant");
        if (last?.emotion) setEmotion(last.emotion);
      }
    } catch {}
    // Load saved language pref
    if (prefs.lang && prefs.lang !== "en") setLang(prefs.lang);
    if (typeof window !== "undefined") window.speechSynthesis?.getVoices();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatKey]);

  // Auto-greeting: use personalized onboarding message if available, else default
  useEffect(() => {
    if (hasGreetedRef.current) return;
    hasGreetedRef.current = true;
    // Only greet on a fresh session (no saved history loaded yet)
    const hasSaved = !!localStorage.getItem(chatKey);
    if (hasSaved) { setPose("sitting"); return; }
    setPlayGreeting(true); // play greeting video clip on fresh session

    // Try personalized first message from onboarding
    const firstMsgKey = user ? `aicoax_maya_${user.id}_firstmsg` : null;
    const storedFirstMsg = firstMsgKey ? localStorage.getItem(firstMsgKey) : null;
    const greeting = storedFirstMsg || GREETING;
    // Clear after use so it only shows once
    if (storedFirstMsg && firstMsgKey) localStorage.removeItem(firstMsgKey);

    let i = 0;
    setEmotion("happy");
    setSpeaking(true);
    setShowStarters(false);
    setMessages([{ role: "assistant", content: "", emotion: "happy" }]);

    const typewriter = setInterval(() => {
      i++;
      setMessages([{ role: "assistant", content: greeting.slice(0, i), emotion: "happy" }]);
      if (i >= greeting.length) {
        clearInterval(typewriter);
        setSpeaking(false);
        setTimeout(() => {
          setEmotion("neutral");
          setPose("sitting");
          setShowStarters(true);
        }, 900);
      }
    }, 28);

    return () => clearInterval(typewriter);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, chatKey]);

  // Save chat history (per-user)
  useEffect(() => {
    if (messages.length > 0) localStorage.setItem(chatKey, JSON.stringify(messages.slice(-60)));
  }, [messages, chatKey]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Pick best female voice — cached after first call
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chosenVoiceRef = useRef<any>("unset");

  const pickVoice = (ttsLang: string): SpeechSynthesisVoice | null => {
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return null;

    // Tier 1 — high-quality named female voices (best naturalness)
    const tier1 = [
      "Samantha",            // macOS — warm, natural US female ✨
      "Karen",               // macOS — soft Australian female
      "Moira",               // macOS — melodic Irish female
      "Tessa",               // macOS — clear South African female
      "Veena",               // macOS — Indian English female
      "Lekha",               // macOS — Hindi female
      "Victoria",            // macOS — smooth US female
      "Google US English",   // Chrome — decent quality
      "Google UK English Female",
      "Microsoft Zira",      // Windows — natural female
      "Microsoft Heera",     // Windows — Indian English female
      "Microsoft Neerja",    // Windows — Hindi female
    ];

    // For non-English: first try exact locale match excluding male voices
    if (ttsLang !== "en-US") {
      const localeMatch =
        voices.find(v => v.lang === ttsLang && !v.name.toLowerCase().includes("male")) ??
        voices.find(v => v.lang.startsWith(ttsLang.split("-")[0]) && !v.name.toLowerCase().includes("male"));
      if (localeMatch) return localeMatch;
    }

    // Try tier-1 priority list
    for (const name of tier1) {
      const match = voices.find(v => v.name.includes(name));
      if (match) return match;
    }

    // Fallback: any voice not explicitly male
    return (
      voices.find(v => v.name.toLowerCase().includes("female")) ??
      voices.find(v => !v.name.toLowerCase().includes("male")) ??
      null
    );
  };

  const speak = (text: string, onDone?: () => void) => {
    if (typeof window === "undefined" || !window.speechSynthesis || !voiceOn) { onDone?.(); return; }
    window.speechSynthesis.cancel();

    const ttsLang = LANGUAGES.find(l => l.code === lang)?.ttsLang ?? "en-US";

    // Clean text: strip emoji, markdown bold/italic, action asterisks, brackets
    const clean = text
      .replace(/\[.*?\]/g, "")                          // remove [emotion] tags, [text] notes
      .replace(/\*+([^*]+)\*+/g, "$1")                  // *bold* → plain
      .replace(/[\u{1F300}-\u{1FFFF}]/gu, "")           // strip emoji (broad range)
      .replace(/[^\w\s.,!?;:'"-]/g, "")                 // strip remaining special chars
      .replace(/\s+/g, " ").trim();

    if (!clean) return;

    // Smart sentence splitting — natural pause points
    const chunks = clean
      .split(/(?<=[.!?])\s+|(?<=,)\s+(?=\w{4,})/)      // split on sentence ends + long clauses
      .map(s => s.trim()).filter(Boolean);

    // Lazy-init voice (voices list may not be ready on first call)
    if (chosenVoiceRef.current === "unset" as unknown) {
      chosenVoiceRef.current = pickVoice(ttsLang);
    }
    let voice = chosenVoiceRef.current;
    // If voices weren't loaded yet, try again now
    if (!voice) { voice = pickVoice(ttsLang); chosenVoiceRef.current = voice; }

    const isIndian = ttsLang.endsWith("-IN");

    // Base personality settings — natural conversational female voice
    // rate 1.0–1.1 = natural speed (NOT slow robot), pitch 1.0–1.1 = genuine female (NOT chipmunk)
    const baseRate  = isIndian ? 0.97 : 1.02;
    const basePitch = isIndian ? 1.05 : 1.08;

    let index = 0;
    setSpeaking(true);

    const speakNext = () => {
      if (index >= chunks.length) { setSpeaking(false); onDone?.(); return; }
      const chunk = chunks[index++].trim();
      if (!chunk || chunk.length < 2) { speakNext(); return; }

      const u = new SpeechSynthesisUtterance(chunk);
      u.lang   = ttsLang;
      u.volume = 1;
      if (voice) u.voice = voice;

      // Natural pitch modulation — subtle, not dramatic
      if (chunk.endsWith("?")) {
        u.rate  = baseRate * 0.97;          // slow slightly for questions
        u.pitch = basePitch + 0.08;         // slight rise on questions
      } else if (chunk.endsWith("!")) {
        u.rate  = baseRate * 1.06;          // slightly faster for excitement
        u.pitch = basePitch + 0.05;
      } else {
        u.rate  = baseRate + (Math.random() * 0.04 - 0.02);   // ±2% natural variation
        u.pitch = basePitch + (Math.random() * 0.04 - 0.02);  // ±2% natural variation
      }

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
    // Stop mic immediately so Maya's voice doesn't get picked up as user input
    recognitionRef.current?.stop();
    setListening(false);

    // Instantly switch to hug video if user is asking for a hug
    const isHugRequest   = /\bhug\b|need a hug|virtual hug|send.*hug|give.*hug|wrap.*arms/i.test(text);
    const isHypeRequest  = /hype me|pump me up|get me excited|fire me up|motivate me|let's go|hype karo|josh dila|excite me/i.test(text);
    if (isHugRequest)  setEmotion("hug");
    if (isHypeRequest) setEmotion("excited");

    const apiMsgs = messages.map(m => ({ role: m.role, content: m.content }));
    apiMsgs.push({ role: "user", content: text });

    setMessages(prev => [...prev, { role: "user", content: text }]);
    setInput("");

    // Floating reaction
    const REACTIONS = ["✨","💙","🤝","💫","🫂","💪","🌊","🌟"];
    setReaction(REACTIONS[Math.floor(Math.random() * REACTIONS.length)]);
    setTimeout(() => setReaction(null), 1400);

    setLoading(true);
    try {
      const res = await fetch("/api/friend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMsgs,
          lang,
          userName: prefs.mayaCallsMe || user?.name?.split(" ")[0] || "friend",
          mayaTone: prefs.mayaTone ?? "gentle",
        }),
      });
      if (!res.body) return;

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
        const match = acc.match(/^\[(neutral|happy|sad|excited|coaxing|thinking|blush|crying|laughing|angry|hug)\]\s*/i);
        if (match) {
          const tagEmotion = match[1].toLowerCase() as Emotion;
          detectedEmotion = isHugRequest ? "hug" : isHypeRequest ? "excited" : tagEmotion;
          setEmotion(detectedEmotion);
          displayText = acc.slice(match[0].length);
        } else {
          if (isHugRequest)  { detectedEmotion = "hug";    setEmotion("hug"); }
          if (isHypeRequest) { detectedEmotion = "excited"; setEmotion("excited"); }
          displayText = acc;
        }

        setMessages(prev => {
          const u = [...prev];
          u[u.length - 1] = { role: "assistant", content: displayText, emotion: detectedEmotion };
          return u;
        });
      }

      setPose("sitting");
      speak(displayText, () => {
        if (voiceModeRef.current) startContinuousListen();
      });
      setTimeout(() => inputRef.current?.focus(), 100);
    } catch (err) {
      console.error("Maya fetch error:", err);
      setMessages(prev => [...prev, { role: "assistant", content: "Ugh, something went wrong on my end. Try again?", emotion: "sad" }]);
      // In voice mode, still restart listening even after error
      if (voiceModeRef.current) setTimeout(() => startContinuousListen(), 1000);
    } finally {
      setLoading(false);
    }
  };

  const [micError, setMicError] = useState<string | null>(null);

  const toggleMic = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;

    if (!SR) {
      setMicError("Speech recognition not supported. Please use Chrome or Edge.");
      setTimeout(() => setMicError(null), 4000);
      return;
    }

    // Stop if already listening
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    // Explicitly request mic permission so the browser prompts the user
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Release immediately — SpeechRecognition manages its own stream
      stream.getTracks().forEach(t => t.stop());
    } catch {
      setMicError("Mic access denied. Allow microphone in your browser settings.");
      setTimeout(() => setMicError(null), 5000);
      return;
    }

    setMicError(null);
    const r = new SR();
    r.lang = LANGUAGES.find(l => l.code === lang)?.ttsLang ?? "en-US";
    r.continuous = false;
    r.interimResults = true; // Show words appearing in real-time

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    r.onresult = (e: any) => {
      // Accumulate all results (interim + final)
      let transcript = "";
      for (let i = 0; i < e.results.length; i++) {
        transcript += e.results[i][0].transcript;
      }
      setInput(transcript);
    };

    r.onend = () => setListening(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    r.onerror = (e: any) => {
      setListening(false);
      if (e.error === "not-allowed") {
        setMicError("Mic blocked. Allow microphone access and try again.");
      } else if (e.error === "no-speech") {
        setMicError("No speech detected. Try speaking louder.");
      } else {
        setMicError(`Mic error: ${e.error}`);
      }
      setTimeout(() => setMicError(null), 4000);
    };

    recognitionRef.current = r;
    r.start();
    setListening(true);
  };

  const reset = () => {
    window.speechSynthesis?.cancel();
    setMessages([]); setShowStarters(true);
    setEmotion("neutral"); setSpeaking(false);
    localStorage.removeItem(chatKey);
  };

  const toggleVoice = () => {
    if (voiceOn) window.speechSynthesis?.cancel();
    setSpeaking(false); setVoiceOn(v => !v);
  };

  /* ── Voice Mode (continuous hands-free) ── */
  const startVoiceMode = () => {
    setVoiceMode(true);
    voiceModeRef.current = true;
    setVoiceOn(true);
    startContinuousListen();
  };

  const endVoiceMode = () => {
    setVoiceMode(false);
    voiceModeRef.current = false;
    recognitionRef.current?.stop();
    setListening(false);
    window.speechSynthesis?.cancel();
  };

  const startContinuousListen = () => {
    if (typeof window === "undefined") return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.lang = LANGUAGES.find(l => l.code === lang)?.ttsLang ?? "en-US";
    r.interimResults = false;
    r.continuous = false; // restart after each result
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    r.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      if (transcript.trim()) send(transcript);
    };
    r.onend = () => {
      setListening(false);
      // Do NOT auto-restart here — speak() will call startContinuousListen via onDone callback
      // This prevents mic from picking up Maya's own voice mid-speech
    };
    r.onerror = () => { setListening(false); };
    recognitionRef.current = r;
    r.start();
    setListening(true);
  };

  const hasChat = messages.length > 0;

  /* ── Language picker (rendered as function, not component, to avoid remount on state change) ── */
  const renderLangPicker = () => (
    <div className="relative">
      <button onClick={() => setShowLangPicker(v => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors text-xs font-medium text-slate-300">
        <span className="text-sm">{LANGUAGES.find(l => l.code === lang)?.flag}</span>
        <span className="hidden sm:inline">{LANGUAGES.find(l => l.code === lang)?.label}</span>
        <span className="text-slate-500 text-[10px]">▾</span>
      </button>
      <AnimatePresence>
        {showLangPicker && (
          <motion.div initial={{ opacity: 0, y: -6, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.95 }}
            className="absolute right-0 top-10 z-50 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 w-52 max-h-72 overflow-y-auto">
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide px-2 mb-1.5">Maya speaks in…</p>
            {LANGUAGES.map(l => (
              <button key={l.code} onClick={() => { setLang(l.code); setShowLangPicker(false); chosenVoiceRef.current = "unset"; }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors ${
                  lang === l.code ? "bg-teal-900/50 text-teal-300 border border-teal-700/40" : "text-slate-300 hover:bg-slate-800"
                }`}>
                <span className="text-base">{l.flag}</span>
                <span className="font-medium">{l.label}</span>
                {lang === l.code && <span className="ml-auto text-teal-400 text-xs">✓</span>}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  /* ── Chat messages list ── */
  const renderChatMessages = () => (
    <div className="space-y-3">
      {messages.map((m, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          className={`flex gap-2 items-end ${m.role === "user" ? "justify-end" : "justify-start"}`}>
          {m.role === "assistant" && (
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center text-sm shrink-0 shadow-md">🧡</div>
          )}
          <div className={`max-w-[80%] sm:max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
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
            <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-sm shrink-0">{user?.avatar ?? "😊"}</div>
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
  );

  /* ── Input bar ── */
  const renderInputBar = () => (
    <div className="shrink-0 px-3 sm:px-4 pb-4 pt-2 bg-slate-900/60 border-t border-slate-800 backdrop-blur-sm">
      {hasChat && !loading && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {QUICK_REPLIES.map((q, i) => (
            <button key={i} onClick={() => {
              // Instantly show hug video before API responds
              if (/hug/i.test(q.text)) setEmotion("hug");
              send(q.text);
            }}
              className="shrink-0 text-xs text-slate-300 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 hover:border-pink-600/40 rounded-full px-3 py-1.5 transition-all whitespace-nowrap">
              {q.label}
            </button>
          ))}
        </div>
      )}
      {micError && (
        <div className="mb-2 px-3 py-2 bg-red-900/40 border border-red-700/50 rounded-xl text-red-300 text-xs flex items-center gap-2">
          <MicOff className="w-3.5 h-3.5 shrink-0" /> {micError}
        </div>
      )}
      {listening && (
        <div className="mb-2 px-3 py-2 bg-teal-900/30 border border-teal-700/40 rounded-xl text-teal-300 text-xs flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse inline-block" /> Listening… speak now
        </div>
      )}
      <div className="flex gap-2 items-center">
        <input ref={inputRef}
          className="flex-1 bg-slate-800/80 border border-slate-700 rounded-2xl pl-4 pr-3 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-pink-500/60 transition-colors"
          placeholder={listening ? "🎙 speak now…" : "just talk to me 💙"}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
          disabled={loading}
        />
        <button onClick={toggleMic}
          className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            listening ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-900/50" : "bg-slate-700 hover:bg-slate-600 text-slate-300"
          }`}>
          {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>
        <button onClick={() => send(input)} disabled={loading || !input.trim()}
          className="shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 disabled:opacity-40 text-white flex items-center justify-center transition-all shadow-lg shadow-pink-900/40">
          {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
      {!hasChat && (
        <p className="text-center text-[10px] text-slate-700 mt-2 flex items-center justify-center gap-1 flex-wrap">
          <Sparkles className="w-3 h-3" />
          Maya is an AI — not a real person · crisis help:
          <Link href="/crisis" className="underline text-slate-600">iCall 9152987821</Link>
        </p>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-slate-950 overflow-hidden">
      {/* Header */}
      <header className="shrink-0 px-3 sm:px-4 py-3 border-b border-slate-800/60 bg-slate-900/70 backdrop-blur-sm flex items-center justify-between gap-2 z-20">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link href="/" className="text-slate-500 hover:text-white transition-colors shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="min-w-0">
            <h1 className="font-bold text-white leading-none">Maya</h1>
            <p className="text-[10px] text-green-400 hidden sm:block">● Online · AI companion</p>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {renderLangPicker()}
          <button onClick={toggleVoice} title={voiceOn ? "Mute" : "Unmute"}
            className={`p-2 rounded-lg transition-colors ${voiceOn ? "text-teal-400 hover:bg-slate-800" : "text-slate-600 hover:bg-slate-800"}`}>
            {voiceOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          {hasChat && (
            <button onClick={reset} className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
          <button onClick={startVoiceMode} title="Voice call with Maya"
            className="p-2 rounded-lg text-teal-400 hover:bg-slate-800 transition-colors hidden sm:flex items-center gap-1">
            <Phone className="w-4 h-4" />
          </button>
          <Link href="/profile" className="p-1.5 text-slate-500 hover:text-white transition-colors rounded-lg hover:bg-slate-800" title="Settings">
            <span className="text-lg leading-none">{user?.avatar ?? "⚙️"}</span>
          </Link>
        </div>
      </header>

      {/* ── MOBILE layout (< md) ── */}
      <div className="md:hidden flex flex-col flex-1 overflow-hidden">
        {/* Avatar - compact on mobile */}
        <div className={`shrink-0 flex flex-col items-center justify-center transition-all duration-500 ${hasChat ? "py-2" : "py-6"}`}>
          <MayaAvatar emotion={emotion} speaking={speaking} pose={pose} size={hasChat ? 90 : 150} playGreeting={playGreeting} />
          {!hasChat && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-3 text-center px-4">
              <p className="text-white font-semibold">Hi, I&apos;m Maya 🧡</p>
              <p className="text-slate-400 text-xs mt-1">Your AI best friend — here to listen, console, and hype you up.</p>
            </motion.div>
          )}
        </div>

        {/* Chat / starters */}
        <div className="flex-1 overflow-y-auto px-3 pb-2">
          {showStarters && !hasChat ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto space-y-4">
              <div className="flex gap-2 items-end">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center text-sm shrink-0">🧡</div>
                <div className="bg-slate-800 rounded-2xl rounded-bl-sm px-4 py-3 max-w-xs">
                  <p className="text-sm text-white leading-relaxed">what&apos;s going on? I&apos;m all ears 💙</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {MOODS.map((m, i) => (
                  <motion.button key={i} initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                    onClick={() => send(m.starter)} whileTap={{ scale: 0.96 }}
                    className={`text-left rounded-2xl p-3 border transition-all ${m.color}`}>
                    <span className="text-lg block mb-1">{m.emoji}</span>
                    <span className="text-xs text-white font-medium">{m.label}</span>
                  </motion.button>
                ))}
              </div>
              <div className="space-y-2">
                {HYPE.map((h, i) => (
                  <motion.button key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + i * 0.07 }}
                    onClick={() => send(h.text)}
                    className="w-full text-left bg-slate-900 border border-slate-700 hover:border-pink-600/50 rounded-xl px-4 py-3 transition-all flex items-center gap-3">
                    <span className="text-xl">{h.emoji}</span>
                    <span className="text-sm text-slate-300">{h.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="max-w-2xl mx-auto">{renderChatMessages()}</div>
          )}
        </div>
        {renderInputBar()}
      </div>

      {/* ── DESKTOP layout (≥ md) — side by side ── */}
      <div className="hidden md:flex flex-1 overflow-hidden">
        {/* Left: Maya panel */}
        <div className="w-72 lg:w-80 xl:w-96 shrink-0 flex flex-col border-r border-slate-800/60 bg-slate-900/40">
          {/* Avatar */}
          <div className="flex-1 flex flex-col items-center justify-center py-8 px-6">
            <MayaAvatar emotion={emotion} speaking={speaking} pose={pose} size={200} playGreeting={playGreeting} />
            <motion.div className="mt-6 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              <p className="text-white font-bold text-lg">Maya</p>
              <p className="text-green-400 text-xs mt-1">● Online · AI companion</p>
              {prefs.mayaCallsMe && (
                <p className="text-slate-500 text-xs mt-2">Chatting with {prefs.mayaCallsMe}</p>
              )}
            </motion.div>
          </div>

          {/* Tone / mood badge */}
          <div className="shrink-0 px-6 pb-6 space-y-3">
            <div className="bg-slate-800/60 rounded-2xl p-4 text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Maya&apos;s mood</p>
              <p className="text-2xl capitalize">{emotion === "neutral" ? "😐" : emotion === "happy" ? "😊" : emotion === "sad" ? "😢" : emotion === "excited" ? "🤩" : emotion === "coaxing" ? "💪" : emotion === "thinking" ? "🤔" : emotion === "blush" ? "🥰" : emotion === "crying" ? "😭" : emotion === "laughing" ? "😂" : "😤"}</p>
              <p className="text-slate-400 text-xs mt-1 capitalize">{emotion}</p>
            </div>
            <Link href="/profile" className="flex items-center justify-center gap-2 text-slate-500 hover:text-white text-xs transition-colors py-2 rounded-xl hover:bg-slate-800/60">
              ⚙️ <span>Personalise Maya</span>
            </Link>
          </div>
        </div>

        {/* Right: Chat panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {showStarters && !hasChat ? (
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto space-y-5">
                <div className="flex gap-2 items-end">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center text-sm shrink-0">🧡</div>
                  <div className="bg-slate-800 rounded-2xl rounded-bl-sm px-4 py-3 max-w-sm">
                    <p className="text-sm text-white leading-relaxed">what&apos;s going on? I&apos;m all ears 💙 pick one or just type it out</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                  {MOODS.map((m, i) => (
                    <motion.button key={i} initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                      onClick={() => send(m.starter)} whileTap={{ scale: 0.96 }}
                      className={`text-left rounded-2xl p-3.5 border transition-all ${m.color}`}>
                      <span className="text-xl block mb-1">{m.emoji}</span>
                      <span className="text-sm text-white font-medium">{m.label}</span>
                    </motion.button>
                  ))}
                </div>
                <div className="space-y-2">
                  {HYPE.map((h, i) => (
                    <motion.button key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + i * 0.07 }}
                      onClick={() => send(h.text)}
                      className="w-full text-left bg-slate-900 border border-slate-700 hover:border-pink-600/50 hover:bg-slate-800 rounded-xl px-4 py-3 transition-all flex items-center gap-3">
                      <span className="text-xl">{h.emoji}</span>
                      <span className="text-sm text-slate-300">{h.label}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="max-w-2xl mx-auto">{renderChatMessages()}</div>
            </div>
          )}
          {renderInputBar()}
        </div>
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

      {/* ── Voice Mode fullscreen overlay ── */}
      <AnimatePresence>
        {voiceMode && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-between py-16 px-8">
            {/* Top */}
            <div className="text-center">
              <p className="text-slate-400 text-sm uppercase tracking-widest">Voice conversation</p>
              <h2 className="text-white font-bold text-xl mt-1">Maya is listening</h2>
            </div>

            {/* Avatar */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                {listening && (
                  <div className="absolute inset-0 rounded-full bg-teal-400/20 animate-ping scale-150" />
                )}
                <MayaAvatar emotion={emotion} speaking={speaking} pose="sitting" size={220} playGreeting={playGreeting} />
              </div>

              {/* Status */}
              <div className="flex items-center gap-2 mt-2">
                {speaking ? (
                  <div className="flex items-center gap-2 bg-pink-900/30 border border-pink-700/40 rounded-full px-4 py-2">
                    <div className="flex gap-0.5">
                      {[0,100,200,300,400].map(d => (
                        <div key={d} className="w-1 bg-pink-400 rounded-full animate-bounce" style={{ height: `${8 + Math.random() * 12}px`, animationDelay: `${d}ms` }} />
                      ))}
                    </div>
                    <span className="text-pink-300 text-sm font-medium">Maya is speaking</span>
                  </div>
                ) : listening ? (
                  <div className="flex items-center gap-2 bg-teal-900/30 border border-teal-700/40 rounded-full px-4 py-2">
                    <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
                    <span className="text-teal-300 text-sm font-medium">Listening…</span>
                  </div>
                ) : loading ? (
                  <div className="flex items-center gap-2 bg-slate-800 rounded-full px-4 py-2">
                    <div className="w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-slate-400 text-sm">Thinking…</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-slate-800 rounded-full px-4 py-2">
                    <div className="w-2 h-2 bg-slate-500 rounded-full" />
                    <span className="text-slate-500 text-sm">Ready</span>
                  </div>
                )}
              </div>

              {/* Last message preview */}
              {messages.length > 0 && (
                <div className="max-w-sm text-center">
                  <p className="text-slate-500 text-xs line-clamp-2">
                    {messages[messages.length - 1]?.content?.slice(0, 120)}…
                  </p>
                </div>
              )}
            </div>

            {/* End call button */}
            <button onClick={endVoiceMode}
              className="flex items-center gap-3 bg-red-600 hover:bg-red-500 text-white rounded-full px-8 py-4 font-semibold transition-colors shadow-xl shadow-red-900/40">
              <PhoneOff className="w-5 h-5" />
              End Voice Call
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
