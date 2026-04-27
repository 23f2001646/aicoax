"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Phone, MessageCircle, Heart, AlertTriangle, ExternalLink } from "lucide-react";

const INDIA_RESOURCES = [
  { name: "iCall", number: "9152987821", hours: "Mon–Sat 8am–10pm", desc: "Free, confidential counseling. Call or WhatsApp.", type: "phone" },
  { name: "Vandrevala Foundation", number: "1860-2662-345", hours: "24/7", desc: "Free mental health helpline, 24 hours.", type: "phone" },
  { name: "NIMHANS", number: "080-46110007", hours: "24/7", desc: "National mental health support from NIMHANS Bangalore.", type: "phone" },
  { name: "AASRA", number: "9820466627", hours: "24/7", desc: "Crisis intervention and suicide prevention.", type: "phone" },
  { name: "Snehi", number: "044-24640050", hours: "24/7", desc: "Emotional support and suicide prevention helpline.", type: "phone" },
];

const GLOBAL_RESOURCES = [
  { name: "Crisis Text Line (US/UK)", contact: "Text HOME to 741741", desc: "Free 24/7 crisis support via text." },
  { name: "Samaritans (UK)", contact: "116 123", desc: "Free 24/7 confidential listening." },
  { name: "Befrienders Worldwide", contact: "befrienders.org", desc: "Find a helpline in your country." },
];

const GROUNDING = [
  { n: "5", emoji: "👀", label: "things you can SEE" },
  { n: "4", emoji: "✋", label: "things you can TOUCH" },
  { n: "3", emoji: "👂", label: "things you can HEAR" },
  { n: "2", emoji: "👃", label: "things you can SMELL" },
  { n: "1", emoji: "👅", label: "thing you can TASTE" },
];

export default function CrisisPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm px-4 py-3 flex items-center gap-3">
        <Link href="/" className="text-slate-400 hover:text-white transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
        <div>
          <h1 className="font-bold text-white">Crisis Support</h1>
          <p className="text-xs text-slate-500">Real help from real humans</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8 space-y-8">
        {/* Immediate message */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-teal-900/40 to-cyan-900/40 border border-teal-700/40 rounded-2xl p-6 text-center">
          <Heart className="w-10 h-10 text-teal-400 mx-auto mb-3" fill="currentColor" />
          <h2 className="text-xl font-bold text-white mb-2">You are not alone</h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Whatever you&apos;re going through right now — it matters, and you matter.
            Trained crisis counselors are available right now to listen, without judgment.
          </p>
        </motion.div>

        {/* If in immediate danger */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-red-900/30 border border-red-700/50 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h3 className="font-semibold text-red-300">If you or someone is in immediate danger</h3>
          </div>
          <p className="text-white text-2xl font-black mb-1">Call 112</p>
          <p className="text-sm text-slate-400">Emergency services (India) — available 24/7</p>
        </motion.div>

        {/* India helplines */}
        <div>
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">India Helplines</h3>
          <div className="space-y-3">
            {INDIA_RESOURCES.map((r, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-teal-900/50 border border-teal-700/40 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-teal-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p className="font-semibold text-white text-sm">{r.name}</p>
                    <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full shrink-0">{r.hours}</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">{r.desc}</p>
                  <a href={`tel:${r.number.replace(/[-\s]/g, "")}`}
                    className="inline-flex items-center gap-1.5 text-teal-400 hover:text-teal-300 text-sm font-semibold transition-colors">
                    <Phone className="w-3.5 h-3.5" />{r.number}
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Global */}
        <div>
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">International</h3>
          <div className="space-y-3">
            {GLOBAL_RESOURCES.map((r, i) => (
              <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-start gap-4">
                <MessageCircle className="w-5 h-5 text-violet-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-white text-sm mb-0.5">{r.name}</p>
                  <p className="text-xs text-slate-400 mb-1">{r.desc}</p>
                  <p className="text-violet-400 text-sm font-medium">{r.contact}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5-4-3-2-1 Grounding */}
        <div>
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-1">Right now: Ground yourself</h3>
          <p className="text-xs text-slate-500 mb-3">If you feel overwhelmed, this technique can slow your nervous system down in 60 seconds.</p>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <p className="text-sm font-semibold text-white mb-4">5-4-3-2-1 Grounding Technique</p>
            <div className="space-y-3">
              {GROUNDING.map((g, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.1 }}
                  className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-600 to-cyan-600 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-white">{g.n}</span>
                  </div>
                  <span className="text-lg">{g.emoji}</span>
                  <span className="text-sm text-slate-300">{g.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* What AI can't do */}
        <div className="bg-amber-900/20 border border-amber-700/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <p className="text-sm font-semibold text-amber-300">AiCoax is not a crisis service</p>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            I&apos;m an AI companion that can listen and help with everyday mental health.
            But in a crisis, you need a real human. Please call one of the numbers above —
            they&apos;re free, confidential, and available right now.
          </p>
        </div>

        <div className="text-center">
          <Link href="/" className="text-teal-400 hover:text-teal-300 text-sm flex items-center justify-center gap-1 transition-colors">
            <ExternalLink className="w-4 h-4" /> Back to AiCoax companion
          </Link>
        </div>
      </main>
    </div>
  );
}
