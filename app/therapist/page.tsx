"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ExternalLink, Star, Copy, Check, Sparkles } from "lucide-react";
import { useApp } from "@/components/AppProviders";
import { uKey } from "@/lib/auth";

interface Platform {
  id: string;
  name: string;
  tagline: string;
  logo: string;
  url: string;
  priceRange: "free" | "budget" | "mid" | "premium";
  priceLabel: string;
  languages: string[];
  specialities: string[];
  mode: string[];
  rating: number;
  highlight: string;
}

const PLATFORMS: Platform[] = [
  {
    id: "icall",
    name: "iCall",
    tagline: "Free counselling by TISS",
    logo: "🏛️",
    url: "https://icallhelpline.org",
    priceRange: "free",
    priceLabel: "Free",
    languages: ["English", "Hindi", "Marathi"],
    specialities: ["Anxiety", "Depression", "Trauma", "Relationships", "Academic stress"],
    mode: ["Phone", "Chat", "Face-to-face"],
    rating: 4.6,
    highlight: "Government-backed, TISS-trained counsellors",
  },
  {
    id: "yourdost",
    name: "YourDOST",
    tagline: "Expert guidance 24/7",
    logo: "💛",
    url: "https://yourdost.com",
    priceRange: "budget",
    priceLabel: "₹500–₹1,500/session",
    languages: ["English", "Hindi", "Bengali", "Tamil", "Telugu"],
    specialities: ["Anxiety", "Burnout", "Career", "Relationships", "Self-esteem"],
    mode: ["Video", "Phone", "Chat", "Text"],
    rating: 4.4,
    highlight: "Anonymous, available round the clock",
  },
  {
    id: "vandrevala",
    name: "Vandrevala Foundation",
    tagline: "Crisis & counselling helpline",
    logo: "🔵",
    url: "https://vandrevalafoundation.com",
    priceRange: "free",
    priceLabel: "Free",
    languages: ["English", "Hindi", "Gujarati", "Marathi", "Tamil"],
    specialities: ["Crisis", "Suicide prevention", "Depression", "Grief", "Trauma"],
    mode: ["Phone", "Chat"],
    rating: 4.7,
    highlight: "24/7 crisis line — 1860-2662-345",
  },
  {
    id: "mindpeers",
    name: "MindPeers",
    tagline: "Mental fitness for professionals",
    logo: "🧠",
    url: "https://mindpeers.co",
    priceRange: "mid",
    priceLabel: "₹1,000–₹2,500/session",
    languages: ["English", "Hindi"],
    specialities: ["Burnout", "Work stress", "Leadership", "Anxiety", "Performance"],
    mode: ["Video", "Phone"],
    rating: 4.5,
    highlight: "Specialises in corporate & startup burnout",
  },
  {
    id: "wysa",
    name: "Wysa",
    tagline: "AI + human therapy",
    logo: "🐧",
    url: "https://wysa.io",
    priceRange: "budget",
    priceLabel: "Free AI · ₹800/human session",
    languages: ["English", "Hindi"],
    specialities: ["Anxiety", "Stress", "Sleep", "Self-harm", "Mood"],
    mode: ["App", "Chat", "Video"],
    rating: 4.3,
    highlight: "CBT-based AI coach + licensed therapists",
  },
  {
    id: "betterhelpindia",
    name: "BetterHelp",
    tagline: "Global therapy, Indian therapists",
    logo: "🌏",
    url: "https://betterhelp.com",
    priceRange: "premium",
    priceLabel: "₹2,500–₹5,000/month",
    languages: ["English", "Hindi", "Punjabi"],
    specialities: ["Depression", "Anxiety", "Trauma", "LGBTQ+", "Couples"],
    mode: ["Video", "Phone", "Chat", "Text"],
    rating: 4.2,
    highlight: "Unlimited messaging + weekly video sessions",
  },
];

const PRICE_COLORS = {
  free:    "bg-green-900/30 text-green-300 border-green-700/40",
  budget:  "bg-teal-900/30 text-teal-300 border-teal-700/40",
  mid:     "bg-blue-900/30 text-blue-300 border-blue-700/40",
  premium: "bg-purple-900/30 text-purple-300 border-purple-700/40",
};

export default function TherapistPage() {
  const { user, prefs } = useApp();
  const router = useRouter();
  const [priceFilter, setPriceFilter] = useState<string>("all");
  const [specialityFilter, setSpecialityFilter] = useState<string>("all");
  const [recommendation, setRecommendation] = useState("");
  const [loadingRec, setLoadingRec] = useState(false);
  const [report, setReport] = useState("");
  const [copied, setCopied] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const allSpecialities = Array.from(new Set(PLATFORMS.flatMap(p => p.specialities))).sort();

  const filtered = PLATFORMS.filter(p => {
    if (priceFilter !== "all" && p.priceRange !== priceFilter) return false;
    if (specialityFilter !== "all" && !p.specialities.includes(specialityFilter)) return false;
    return true;
  });

  async function getMayaRecommendation() {
    if (!user) return;
    setLoadingRec(true);
    const moodsRaw = localStorage.getItem(uKey(user.id, "moods"));
    const moods = moodsRaw ? JSON.parse(moodsRaw).slice(-7) : [];
    const avgMood = moods.length ? (moods.reduce((s: number, m: {mood:number}) => s + m.mood, 0) / moods.length).toFixed(1) : "unknown";
    const reason = prefs?.onboardingReason || "general wellbeing";

    const res = await fetch("/api/companion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{
          role: "user",
          content: `Based on this information about a user: primary concern is "${reason}", average mood this week is ${avgMood}/5 (0=very low, 5=excellent).

From these therapy platforms: ${PLATFORMS.map(p => `${p.name} (${p.priceLabel}, specialities: ${p.specialities.join(", ")})`).join(" | ")}.

Recommend the best 2 platforms for this person in 3-4 warm sentences. Mention why each fits their specific situation. Be gentle and encouraging.`
        }]
      }),
    });

    if (res.body) {
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        setRecommendation(acc);
      }
    }
    setLoadingRec(false);
  }

  function generateReport() {
    if (!user) return;
    const moodsRaw = localStorage.getItem(uKey(user.id, "moods"));
    const moods = moodsRaw ? JSON.parse(moodsRaw).slice(-7) : [];
    const avgMood = moods.length ? (moods.reduce((s: number, m: {mood:number}) => s + m.mood, 0) / moods.length).toFixed(1) : "N/A";
    const name = prefs?.mayaCallsMe || "User";
    const date = new Date().toLocaleDateString("en", { year:"numeric", month:"long", day:"numeric" });

    const text = `AiCoax — Referral Summary for ${name}
Date: ${date}
────────────────────────────
Primary concern: ${prefs?.onboardingReason || "general wellbeing"}
Avg mood (last 7 days): ${avgMood}/5
Check-ins logged: ${moods.length}
Maya tone preference: ${prefs?.mayaTone || "gentle"}

RECENT MOOD TREND
${moods.slice(-5).map((m: {date:string;mood:number;note?:string}) => `  ${m.date}: ${["Very Low","Low","Neutral","Good","Great","Excellent"][m.mood]}${m.note ? " — " + m.note : ""}`).join("\n") || "No data"}

ADDITIONAL CONTEXT
This summary was generated by AiCoax, an AI mental health companion app.
The user has been engaging with reflective journaling and daily mood tracking.

────────────────────────────
Generated by AiCoax · For professional use`;
    setReport(text);
    setShowReport(true);
  }

  async function copyReport() {
    await navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-8">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm px-4 sm:px-6 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => router.back()} className="text-slate-400 hover:text-white p-1 transition-colors"><ArrowLeft className="w-5 h-5" /></button>
        <div className="flex-1">
          <h1 className="font-bold text-white">Therapist Connect</h1>
          <p className="text-xs text-slate-500">Find professional support in India</p>
        </div>
        <button onClick={generateReport} className="text-xs text-teal-400 border border-teal-700/50 px-3 py-1.5 rounded-lg hover:text-teal-300 transition-colors">
          Share Report
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Maya recommendation */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" /> Maya&apos;s Recommendation
            </p>
            <button onClick={getMayaRecommendation} disabled={loadingRec}
              className="text-xs text-purple-400 hover:text-purple-300 border border-purple-700/50 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
              {loadingRec ? "Thinking…" : "Ask Maya"}
            </button>
          </div>
          {recommendation ? (
            <p className="text-slate-300 text-sm leading-relaxed">{recommendation}</p>
          ) : (
            <p className="text-slate-500 text-sm">Let Maya suggest the best platform based on your mood data and concerns.</p>
          )}
        </div>

        {/* Filters */}
        <div className="space-y-3">
          <div className="flex gap-2 flex-wrap">
            {(["all","free","budget","mid","premium"] as const).map(f => (
              <button key={f} onClick={() => setPriceFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors capitalize ${
                  priceFilter === f ? "bg-teal-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
                }`}>
                {f === "all" ? "All prices" : f === "free" ? "Free" : f === "budget" ? "Budget" : f === "mid" ? "Mid-range" : "Premium"}
              </button>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setSpecialityFilter("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${specialityFilter === "all" ? "bg-teal-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}>
              All issues
            </button>
            {["Anxiety","Burnout","Depression","Grief","Trauma","Relationships"].map(s => (
              <button key={s} onClick={() => setSpecialityFilter(s === specialityFilter ? "all" : s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${specialityFilter === s ? "bg-teal-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Platform cards */}
        <div className="space-y-4">
          {filtered.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-start gap-3">
                <div className="text-3xl shrink-0">{p.logo}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-white font-bold">{p.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${PRICE_COLORS[p.priceRange]}`}>{p.priceLabel}</span>
                  </div>
                  <p className="text-slate-400 text-sm">{p.tagline}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span className="text-yellow-400 text-xs font-medium">{p.rating}</span>
                  </div>
                </div>
                <a href={p.url} target="_blank" rel="noopener noreferrer"
                  className="shrink-0 flex items-center gap-1 bg-teal-700 hover:bg-teal-600 text-white text-xs px-3 py-2 rounded-xl transition-colors">
                  Visit <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <p className="text-teal-300 text-xs font-medium bg-teal-900/20 border border-teal-700/30 rounded-lg px-3 py-2">
                ✦ {p.highlight}
              </p>

              <div className="flex flex-wrap gap-1.5">
                {p.specialities.map(s => (
                  <span key={s} className="bg-slate-800 text-slate-400 text-xs px-2 py-1 rounded-lg">{s}</span>
                ))}
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Modes: {p.mode.join(" · ")}</span>
                <span>·</span>
                <span>Languages: {p.languages.slice(0,3).join(", ")}{p.languages.length > 3 ? " +" + (p.languages.length - 3) : ""}</span>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <p className="text-slate-500 text-center py-8">No platforms match these filters</p>
          )}
        </div>

        {/* Crisis note */}
        <div className="bg-red-900/20 border border-red-700/40 rounded-2xl p-4">
          <p className="text-red-300 text-sm font-medium">🆘 In crisis right now?</p>
          <p className="text-red-400 text-xs mt-1">Call <strong>iCall: 9152987821</strong> or <strong>Vandrevala: 1860-2662-345</strong> — both free, 24/7</p>
        </div>
      </main>

      {/* Share report modal */}
      <AnimatePresence>
        {showReport && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowReport(false)}>
            <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-slate-900 border border-slate-700 rounded-2xl p-5 w-full max-w-lg space-y-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-white">Referral Summary</p>
                <button onClick={() => setShowReport(false)} className="text-slate-500 hover:text-white">✕</button>
              </div>
              <pre className="bg-slate-800 rounded-xl p-4 text-slate-300 text-xs whitespace-pre-wrap max-h-72 overflow-y-auto">{report}</pre>
              <button onClick={copyReport}
                className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl py-3 font-medium transition-colors">
                {copied ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy for Therapist</>}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
