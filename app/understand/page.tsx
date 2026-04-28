"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronRight, X, Brain, Zap, Battery, Moon, Users, Heart } from "lucide-react";

const TOPICS = [
  {
    id: "anxiety",
    title: "Understanding Anxiety",
    icon: <Zap className="w-6 h-6" />,
    color: "from-amber-600 to-orange-600",
    bg: "bg-amber-900/20 border-amber-700/30",
    tagline: "Your brain's alarm system stuck on",
    slides: [
      {
        title: "What anxiety actually is",
        content: "Anxiety is your brain's threat-detection system — evolved to protect you. When you feel anxious, your amygdala fires and floods your body with adrenaline. Your heart races, muscles tense, breathing quickens. It's not weakness. It's your brain doing its job.",
        visual: "brain-alert",
      },
      {
        title: "The anxiety loop",
        content: "Anxious thought → Physical sensation → Avoidance → Short-term relief → MORE anxiety. This cycle keeps anxiety alive. The way out isn't avoidance — it's learning to face the trigger while your nervous system learns it's safe.",
        visual: "cycle",
      },
      {
        title: "What helps",
        content: "• Deep breathing (activates vagus nerve)\n• Grounding: name 5 things you can see\n• Progressive muscle relaxation\n• Gradual exposure to feared situations\n• Challenging 'what if' catastrophic thoughts",
        visual: "tools",
      },
      {
        title: "When to get help",
        content: "Seek professional support if anxiety: prevents you doing everyday activities, lasts more than 6 months, causes panic attacks, leads to avoidance of work/relationships, or significantly reduces your quality of life.",
        visual: "help",
      },
    ],
  },
  {
    id: "depression",
    title: "Understanding Depression",
    icon: <Battery className="w-6 h-6" />,
    color: "from-blue-600 to-indigo-700",
    bg: "bg-blue-900/20 border-blue-700/30",
    tagline: "More than feeling sad",
    slides: [
      {
        title: "Depression is a physical illness",
        content: "Depression changes your brain chemistry — serotonin, dopamine, norepinephrine are all affected. It reduces activity in the prefrontal cortex (decision-making) and overactivates the amygdala (threat detection). It is not a choice, weakness, or laziness.",
        visual: "brain-sad",
      },
      {
        title: "What it actually feels like",
        content: "Beyond sadness: persistent emptiness, loss of interest in things you used to love, exhaustion that sleep doesn't fix, difficulty concentrating, slowed thinking, physical pain, changes in appetite, feeling worthless or hopeless.",
        visual: "symptoms",
      },
      {
        title: "What helps",
        content: "• Behavioral activation: do small things even when you don't want to\n• Exercise (proven as effective as antidepressants for mild-moderate)\n• Social connection, even when it's hard\n• CBT — challenging negative thought patterns\n• Therapy + medication when needed",
        visual: "tools",
      },
      {
        title: "You are not your depression",
        content: "Depression lies. It tells you things will never get better, that you're a burden, that nothing matters. These are symptoms — not facts. Most people with depression recover with proper treatment. Reaching out is the hardest and most important step.",
        visual: "hope",
      },
    ],
  },
  {
    id: "burnout",
    title: "Understanding Burnout",
    icon: <Brain className="w-6 h-6" />,
    color: "from-rose-600 to-red-600",
    bg: "bg-rose-900/20 border-rose-700/30",
    tagline: "Chronic stress that emptied the tank",
    slides: [
      {
        title: "Burnout vs stress",
        content: "Stress: too much pressure, but you still care. Burnout: exhaustion so deep you've stopped caring. Burnout has three dimensions — exhaustion (drained), cynicism (detached), and inefficacy (feeling useless). It's a real medical condition, recognized by WHO.",
        visual: "burnout-meter",
      },
      {
        title: "Warning signs",
        content: "• Dreading work every morning\n• Feeling nothing instead of stress\n• Small tasks feel impossible\n• Cynicism about work/colleagues\n• Physical symptoms: headaches, getting sick often\n• Working more hours but doing less",
        visual: "signs",
      },
      {
        title: "Recovery",
        content: "Burnout recovery takes time. Key: you cannot think your way out. You must change behavior. Rest isn't lazy — it's medical. Set boundaries, reduce load, reconnect with what matters, seek support, take proper breaks.",
        visual: "recovery",
      },
    ],
  },
  {
    id: "stress",
    title: "Understanding Stress",
    icon: <Zap className="w-6 h-6" />,
    color: "from-purple-600 to-violet-600",
    bg: "bg-purple-900/20 border-purple-700/30",
    tagline: "When demands exceed resources",
    slides: [
      {
        title: "Not all stress is bad",
        content: "Eustress (good stress) helps you perform — job interview nerves, pre-exam focus. Distress (bad stress) is when demands persistently exceed your capacity. The problem isn't stress itself; it's chronic, unmanaged stress with no recovery.",
        visual: "curve",
      },
      {
        title: "What chronic stress does to your body",
        content: "Cortisol stays elevated → inflammation increases → immune system weakens → sleep suffers → memory and focus decline → risk of heart disease, diabetes, and mental health issues rises. Your body pays for your mind's overload.",
        visual: "body",
      },
      {
        title: "The stress toolkit",
        content: "• Breathing: fastest way to downregulate\n• Exercise: burns off cortisol and adrenaline\n• Sleep: non-negotiable — restores all systems\n• Social support: proven stress buffer\n• Journaling: externalizes the internal load\n• Saying no: protecting your bandwidth",
        visual: "toolkit",
      },
    ],
  },
  {
    id: "sleep",
    title: "Sleep & Mental Health",
    icon: <Moon className="w-6 h-6" />,
    color: "from-indigo-600 to-blue-700",
    bg: "bg-indigo-900/20 border-indigo-700/30",
    tagline: "The foundation everything else rests on",
    slides: [
      {
        title: "Why sleep is mental health",
        content: "During sleep, your brain clears toxins (including stress hormones), consolidates memories, regulates emotion, and repairs itself. One bad night impairs your prefrontal cortex like being legally drunk. Chronic poor sleep doubles risk of depression and anxiety.",
        visual: "sleep-brain",
      },
      {
        title: "Sleep hygiene that actually works",
        content: "• Same wake time every day (including weekends)\n• No screens 30-60 min before bed (blue light delays melatonin)\n• Keep bedroom cool (18-20°C ideal)\n• No caffeine after 2pm\n• Wind-down routine signals sleep to your brain",
        visual: "hygiene",
      },
      {
        title: "When you can't sleep",
        content: "Don't lie there frustrated — get up and do something calm. Anxiety about not sleeping makes it worse (hyperarousal). Try 4-7-8 breathing. Write down tomorrow's worries to empty your mind. CBT-I (Cognitive Behavioral Therapy for Insomnia) is more effective than sleeping pills.",
        visual: "insomnia",
      },
    ],
  },
  {
    id: "connection",
    title: "Connection & Loneliness",
    icon: <Users className="w-6 h-6" />,
    color: "from-teal-600 to-cyan-600",
    bg: "bg-teal-900/20 border-teal-700/30",
    tagline: "Human connection is a biological need",
    slides: [
      {
        title: "Loneliness is a health crisis",
        content: "Loneliness increases risk of premature death by 26% — comparable to smoking 15 cigarettes a day. It triggers the same pain pathways as physical injury. The brain treats social disconnection as a survival threat.",
        visual: "connection-brain",
      },
      {
        title: "Quality over quantity",
        content: "It's not about how many people you know. One genuine connection matters more than 100 shallow ones. Research shows feeling truly understood by even one person dramatically reduces cortisol and improves outcomes for depression and anxiety.",
        visual: "quality",
      },
      {
        title: "Building connection when it's hard",
        content: "• Reach out to one person today, even briefly\n• Join something with repeated contact (class, group, team)\n• Be the one to go deeper — ask 'how are you really?'\n• Vulnerability builds trust faster than anything\n• Therapy is also connection — it counts",
        visual: "build",
      },
    ],
  },
];

const VISUAL_ICONS: Record<string, string> = {
  "brain-alert": "🧠⚡",
  "cycle": "🔄",
  "tools": "🛠️",
  "help": "🤝",
  "brain-sad": "🧠💙",
  "symptoms": "📋",
  "hope": "🌱",
  "burnout-meter": "🔋",
  "signs": "⚠️",
  "recovery": "🌿",
  "curve": "📈",
  "body": "🫀",
  "toolkit": "🎒",
  "sleep-brain": "🌙🧠",
  "hygiene": "✅",
  "insomnia": "😴",
  "connection-brain": "🤝🧠",
  "quality": "💎",
  "build": "🏗️",
};

export default function UnderstandPage() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [slideIdx, setSlideIdx] = useState(0);

  const topic = TOPICS.find((t) => t.id === activeId);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm px-4 sm:px-6 py-3 flex items-center gap-3">
        <Link href="/" className="text-slate-400 hover:text-white transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
        <div>
          <h1 className="font-bold text-white">Mental Health Library</h1>
          <p className="text-xs text-slate-500">Evidence-based explanations of what's happening in your mind</p>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {!activeId ? (
          <motion.main key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="max-w-2xl mx-auto px-4 py-8">
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Understanding what&apos;s happening in your brain is the first step to feeling better.
              These are evidence-based explanations — not diagnosis.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TOPICS.map((t, i) => (
                <motion.button key={t.id}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                  onClick={() => { setActiveId(t.id); setSlideIdx(0); }}
                  className={`text-left rounded-2xl p-5 border ${t.bg} hover:scale-[1.02] transition-all`}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center mb-3`}>{t.icon}</div>
                  <h3 className="font-semibold text-white mb-1">{t.title}</h3>
                  <p className="text-xs text-slate-400 mb-2">{t.tagline}</p>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <span>{t.slides.length} sections</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.main>
        ) : topic ? (
          <motion.div key="topic" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            {/* Topic header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${topic.color} flex items-center justify-center`}>{topic.icon}</div>
                <div>
                  <h2 className="font-bold text-white">{topic.title}</h2>
                  <p className="text-xs text-slate-500">{slideIdx + 1} of {topic.slides.length}</p>
                </div>
              </div>
              <button onClick={() => setActiveId(null)} className="text-slate-500 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress bar */}
            <div className="h-1 bg-slate-800 rounded-full mb-6 overflow-hidden">
              <motion.div className={`h-full bg-gradient-to-r ${topic.color} rounded-full`}
                animate={{ width: `${((slideIdx + 1) / topic.slides.length) * 100}%` }}
                transition={{ duration: 0.4 }} />
            </div>

            {/* Slide */}
            <AnimatePresence mode="wait">
              <motion.div key={slideIdx}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6 min-h-[280px]">
                {/* Visual */}
                <div className="text-5xl text-center mb-4">
                  {VISUAL_ICONS[topic.slides[slideIdx].visual] || "💭"}
                </div>
                <h3 className="text-lg font-bold text-white mb-4">{topic.slides[slideIdx].title}</h3>
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                  {topic.slides[slideIdx].content}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex gap-3">
              <button onClick={() => setSlideIdx((p) => p - 1)} disabled={slideIdx === 0}
                className="flex-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white rounded-xl py-3 text-sm font-medium transition-colors">
                ← Previous
              </button>
              {slideIdx < topic.slides.length - 1 ? (
                <button onClick={() => setSlideIdx((p) => p + 1)}
                  className={`flex-1 bg-gradient-to-r ${topic.color} text-white rounded-xl py-3 text-sm font-semibold transition-all flex items-center justify-center gap-1`}>
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button onClick={() => setActiveId(null)}
                  className="flex-1 bg-teal-600 hover:bg-teal-500 text-white rounded-xl py-3 text-sm font-semibold transition-colors flex items-center justify-center gap-1">
                  <Heart className="w-4 h-4" /> Done
                </button>
              )}
            </div>

            {/* Dot indicators */}
            <div className="flex justify-center gap-2 mt-4">
              {topic.slides.map((_, i) => (
                <button key={i} onClick={() => setSlideIdx(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === slideIdx ? "bg-white w-4" : "bg-slate-600"}`} />
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
