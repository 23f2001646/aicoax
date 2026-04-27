"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export type Emotion =
  | "neutral" | "happy" | "sad" | "excited"
  | "coaxing" | "thinking" | "blush" | "crying"
  | "laughing" | "angry";

export type MayaPose = "standing" | "sitting";

interface Props {
  emotion: Emotion;
  speaking?: boolean;
  pose?: MayaPose;
  size?: number;
}

/* ── palette ─────────────────────────────────────────────── */
const SKIN   = "#f5d0a8";
const HAIR   = "#1c1c2e";
const SHIRT  = "#f4f0eb";
const SKIRT  = "#8888a0";
const TIGHTS = "#1c1c2e";
const SHOE   = "#2ab5a0";
const CHAIR  = "#c8901e";
const CHAIR2 = "#a87010";
const LIP    = "#c87060";

const IRIS_CLR: Record<Emotion, string> = {
  neutral: "#4a7870", happy: "#8a6040", sad: "#4a5888",
  excited: "#c04878", coaxing: "#6848a8", thinking: "#486080",
  blush: "#906070", crying: "#4868a8", laughing: "#407850", angry: "#a84040",
};

const GLOW_CLR: Record<Emotion, string> = {
  neutral: "#14b8a6", happy: "#f59e0b", sad: "#6366f1",
  excited: "#ec4899", coaxing: "#8b5cf6", thinking: "#64748b",
  blush: "#f472b6", crying: "#3b82f6", laughing: "#22c55e", angry: "#ef4444",
};

const BADGE_TEXT: Record<Emotion, string> = {
  neutral: "listening", happy: "happy 😊", sad: "here for you 💙",
  excited: "excited! 🎉", coaxing: "you've got this 💪", thinking: "thinking 🤔",
  blush: "aww 🥺", crying: "with you 💙", laughing: "lol 😂", angry: "I hear you 😤",
};

/* ── eyebrow paths ───────────────────────────────────────── */
const BROWS: Record<Emotion, [string, string]> = {
  neutral:  ["M 82 58 Q 89 55 96 58",  "M 104 58 Q 111 55 118 58"],
  happy:    ["M 82 55 Q 89 52 96 55",  "M 104 55 Q 111 52 118 55"],
  sad:      ["M 82 58 Q 89 62 96 60",  "M 104 60 Q 111 62 118 58"],
  excited:  ["M 81 53 Q 89 49 96 53",  "M 104 53 Q 111 49 119 53"],
  coaxing:  ["M 82 55 Q 89 51 96 55",  "M 104 55 Q 111 51 118 55"],
  thinking: ["M 82 58 Q 89 56 96 59",  "M 104 56 Q 111 52 118 57"],
  blush:    ["M 82 56 Q 89 53 96 56",  "M 104 56 Q 111 53 118 56"],
  crying:   ["M 82 60 Q 89 64 96 62",  "M 104 62 Q 111 64 118 60"],
  laughing: ["M 81 52 Q 89 47 96 51",  "M 104 51 Q 111 47 119 52"],
  angry:    ["M 80 62 Q 89 55 97 60",  "M 103 60 Q 111 55 120 62"],
};

/* ── expression mouth paths ─────────────────────────────── */
const MOUTHS: Record<Emotion, string> = {
  neutral:  "M 91 86 Q 100 90 109 86",
  happy:    "M 89 84 Q 100 94 111 84",
  sad:      "M 89 91 Q 100 84 111 91",
  excited:  "M 88 82 Q 100 96 112 82",
  coaxing:  "M 91 85 Q 100 93 109 85",
  thinking: "M 93 87 Q 100 86 107 88",
  blush:    "M 91 85 Q 100 93 109 85",
  crying:   "M 89 91 Q 100 83 111 91",
  laughing: "M 87 82 Q 100 98 113 82",
  angry:    "M 90 89 Q 100 82 110 89",
};

/* ── eye open factor per emotion ────────────────────────── */
const EYE_OPEN: Record<Emotion, number>  = {
  neutral:1, happy:0.72, sad:0.95, excited:1.15,
  coaxing:1, thinking:0.8, blush:0.75, crying:0.95,
  laughing:0, angry:0.65,
};
const EYE_TY: Record<Emotion, number> = {
  neutral:0, happy:2, sad:-1, excited:-2,
  coaxing:0, thinking:0, blush:1.5, crying:-1,
  laughing:0, angry:0,
};

/* ── lip-sync phoneme cycle ─────────────────────────────── */
const LIP_CYCLE = [0,0.3,0.72,0.5,1,0.65,0.15,0.85,0.4,0.08,0,0.55,0.9,0.38,0.7,0.1,0];

function mouthOpenFill(f: number): string {
  const hw = 9 + f * 4, drop = f * 12;
  const cy = 86, lx = 100 - hw, rx = 100 + hw;
  return `M ${lx} ${cy} Q 100 ${cy-2} ${rx} ${cy} Q ${rx+2} ${cy+drop*0.55} 100 ${cy+drop} Q ${lx-2} ${cy+drop*0.55} ${lx} ${cy} Z`;
}
function teethFill(f: number): string {
  const hw = 9 + f*4 - 1.5, cy = 86, th = Math.min(f*5,4.5);
  return `M ${100-hw} ${cy} Q 100 ${cy-1} ${100+hw} ${cy} L ${100+hw} ${cy+th} Q 100 ${cy+th+1} ${100-hw} ${cy+th} Z`;
}

/* ═══════════════════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════════════════ */
export default function MayaAvatar({
  emotion, speaking = false, pose = "sitting", size = 200,
}: Props) {
  const [blink,     setBlink]     = useState(false);
  const [mouthOpen, setMouthOpen] = useState(0);

  const glow     = GLOW_CLR[emotion];
  const irisClr  = IRIS_CLR[emotion];
  const eyeOpen  = EYE_OPEN[emotion];
  const ety      = EYE_TY[emotion];
  const closed   = eyeOpen === 0;
  const sitting  = pose === "sitting";

  /* blink */
  useEffect(() => {
    if (closed) return;
    let t: ReturnType<typeof setTimeout>;
    const go = () => {
      t = setTimeout(() => {
        setBlink(true);
        setTimeout(() => { setBlink(false); go(); }, 120);
      }, 2200 + Math.random() * 2600);
    };
    go();
    return () => clearTimeout(t);
  }, [closed]);

  /* lip sync */
  useEffect(() => {
    if (!speaking) { setMouthOpen(0); return; }
    let i = 0;
    const iv = setInterval(() => { setMouthOpen(LIP_CYCLE[i++ % LIP_CYCLE.length]); }, 85);
    return () => clearInterval(iv);
  }, [speaking]);

  const w = size;
  const h = Math.round(size * 1.9);

  return (
    <div className="relative flex flex-col items-center" style={{ width: w, height: h }}>

      {/* ambient glow */}
      <motion.div className="absolute inset-0 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% 40%, ${glow}20, transparent 65%)` }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      <svg viewBox="0 0 200 380" width={w} height={h} style={{ display: "block" }}>

        {/* ── gradient defs ── */}
        <defs>
          <radialGradient id="mg-skin" cx="45%" cy="35%" r="58%">
            <stop offset="0%" stopColor="#fde8cc"/>
            <stop offset="100%" stopColor="#e8b888"/>
          </radialGradient>
          <radialGradient id="mg-shirt" cx="40%" cy="20%" r="70%">
            <stop offset="0%" stopColor="#fdfaf5"/>
            <stop offset="100%" stopColor="#e8e4de"/>
          </radialGradient>
          <radialGradient id="mg-skirt" cx="40%" cy="20%" r="70%">
            <stop offset="0%" stopColor="#9898b0"/>
            <stop offset="100%" stopColor="#70708a"/>
          </radialGradient>
          <linearGradient id="mg-chair" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHAIR}/>
            <stop offset="100%" stopColor={CHAIR2}/>
          </linearGradient>
          <filter id="mg-shadow">
            <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#00000030"/>
          </filter>
        </defs>

        {/* ══ CHAIR (behind character) ══ */}
        <AnimatePresence>
          {sitting && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              {/* back posts */}
              <rect x="52" y="138" width="10" height="162" rx="4" fill="url(#mg-chair)"/>
              <rect x="138" y="138" width="10" height="162" rx="4" fill={CHAIR2}/>
              {/* back slats */}
              <rect x="52" y="158" width="96" height="10" rx="4" fill={CHAIR}/>
              <rect x="52" y="182" width="96" height="10" rx="4" fill={CHAIR}/>
              <rect x="52" y="206" width="96" height="8"  rx="3" fill={CHAIR2} opacity="0.8"/>
              {/* seat */}
              <rect x="44" y="228" width="112" height="14" rx="6" fill="url(#mg-chair)" filter="url(#mg-shadow)"/>
              {/* front legs */}
              <rect x="52" y="241" width="10" height="110" rx="4" fill="url(#mg-chair)"/>
              <rect x="138" y="241" width="10" height="110" rx="4" fill={CHAIR2}/>
              {/* foot crossbar */}
              <rect x="57" y="320" width="86" height="7" rx="3" fill={CHAIR2} opacity="0.8"/>
            </motion.g>
          )}
        </AnimatePresence>

        {/* ══ STANDING LEGS (only when not sitting) ══ */}
        {!sitting && (
          <>
            <rect x="83" y="248" width="16" height="96" rx="6" fill={TIGHTS}/>
            <rect x="101" y="248" width="16" height="96" rx="6" fill="#111122"/>
            {/* shoes */}
            <path d="M 80 342 Q 78 350 82 356 Q 88 360 100 358 Q 105 356 104 350 L 99 342 Z" fill={SHOE}/>
            <path d="M 120 342 Q 122 350 118 356 Q 112 360 100 358 Q 95 356 96 350 L 101 342 Z" fill={SHOE}/>
          </>
        )}

        {/* ══ SITTING LEGS (lower leg below seat) ══ */}
        {sitting && (
          <>
            <rect x="83" y="241" width="16" height="104" rx="6" fill={TIGHTS}/>
            <rect x="101" y="241" width="16" height="104" rx="6" fill="#111122"/>
            {/* shoes */}
            <path d="M 80 343 Q 78 351 82 357 Q 88 361 100 359 Q 105 357 104 351 L 99 343 Z" fill={SHOE}/>
            <path d="M 120 343 Q 122 351 118 357 Q 112 361 100 359 Q 95 357 96 351 L 101 343 Z" fill={SHOE}/>
          </>
        )}

        {/* ══ SKIRT ══ */}
        <motion.path
          animate={{
            d: sitting
              ? "M 74 196 Q 72 222 70 236 Q 70 244 100 246 Q 130 244 130 236 Q 128 222 126 196 Z"
              : "M 70 196 Q 62 226 58 252 Q 55 265 56 270 L 144 270 Q 145 265 142 252 Q 138 226 130 196 Z"
          }}
          transition={{ duration: 0.65, ease: "easeInOut" }}
          fill="url(#mg-skirt)"
        />
        {/* skirt hem shadow */}
        <motion.path
          animate={{
            d: sitting
              ? "M 72 236 Q 100 242 128 236"
              : "M 58 268 Q 100 275 142 268"
          }}
          transition={{ duration: 0.65 }}
          stroke="#60608078" strokeWidth="2" fill="none"
        />

        {/* ══ SHIRT / BODY ══ */}
        <path
          d="M 72 142 Q 68 170 68 196 L 132 196 Q 132 170 128 142 Q 116 134 100 134 Q 84 134 72 142 Z"
          fill="url(#mg-shirt)"
        />
        {/* collar */}
        <ellipse cx="100" cy="141" rx="17" ry="9" fill="#eee9e0"/>
        <ellipse cx="100" cy="138" rx="15" ry="7" fill="url(#mg-shirt)"/>

        {/* ══ LEFT ARM ══ */}
        <path
          d="M 72 146 Q 65 174 63 200 Q 61 212 64 218 Q 68 224 74 220 Q 76 210 76 196 Q 78 172 80 150 Z"
          fill="url(#mg-shirt)"
        />
        <ellipse cx="67" cy="220" rx="7" ry="8" fill="url(#mg-skin)"/>

        {/* ══ RIGHT ARM ══ */}
        <path
          d="M 128 146 Q 135 174 137 200 Q 139 212 136 218 Q 132 224 126 220 Q 124 210 124 196 Q 122 172 120 150 Z"
          fill="url(#mg-shirt)"
        />
        <ellipse cx="133" cy="220" rx="7" ry="8" fill="url(#mg-skin)"/>

        {/* ══ NECK ══ */}
        <rect x="92" y="120" width="16" height="18" rx="5" fill="url(#mg-skin)"/>

        {/* ══ HAIR BACK STRANDS (behind face, sides) ══ */}
        <path d="M 62 70 Q 61 90 61 120 L 61 230 Q 64 238 72 236 L 72 112 L 72 70 Q 70 60 66 56 Z"
          fill={HAIR}/>
        <path d="M 138 70 Q 139 90 139 120 L 139 230 Q 136 238 128 236 L 128 112 L 128 70 Q 130 60 134 56 Z"
          fill={HAIR}/>

        {/* ══ HEAD ══ */}
        <circle cx="100" cy="68" r="36" fill="url(#mg-skin)"/>

        {/* ear left */}
        <ellipse cx="65" cy="70" rx="5.5" ry="8" fill="url(#mg-skin)"/>
        <ellipse cx="65" cy="70" rx="2.5" ry="5" fill="#e0a07852"/>
        {/* ear right */}
        <ellipse cx="135" cy="70" rx="5.5" ry="8" fill="url(#mg-skin)"/>
        <ellipse cx="135" cy="70" rx="2.5" ry="5" fill="#e0a07852"/>

        {/* ══ CHEEK BLUSH ══ */}
        <AnimatePresence>
          {(emotion === "blush" || emotion === "happy" || emotion === "excited" || emotion === "laughing") && (
            <>
              <motion.ellipse key="bl-l" cx="80" cy="76" rx="11" ry="6"
                fill="#ff708055"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}/>
              <motion.ellipse key="bl-r" cx="120" cy="76" rx="11" ry="6"
                fill="#ff708055"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}/>
            </>
          )}
        </AnimatePresence>

        {/* ══ HAIR FRONT CAP ══ */}
        {/* main cap covering top of head */}
        <path d="M 62 72 Q 62 28 100 26 Q 138 28 138 72 Q 126 56 100 54 Q 74 56 62 72 Z"
          fill={HAIR}/>
        {/* volume strands on cap */}
        <path d="M 70 54 Q 72 66 73 76"  stroke="#2e2e42" strokeWidth="5.5" strokeLinecap="round" fill="none"/>
        <path d="M 84 44 Q 85 60 86 74"  stroke="#2e2e42" strokeWidth="5"   strokeLinecap="round" fill="none"/>
        <path d="M 100 42 Q 100 58 100 74" stroke="#363648" strokeWidth="5.5" strokeLinecap="round" fill="none"/>
        <path d="M 116 44 Q 115 60 114 74"  stroke="#2e2e42" strokeWidth="5"   strokeLinecap="round" fill="none"/>
        <path d="M 130 54 Q 128 66 127 76"  stroke="#2e2e42" strokeWidth="5.5" strokeLinecap="round" fill="none"/>
        {/* hair shine highlight */}
        <path d="M 80 32 Q 100 28 120 34" stroke="#4a4a64" strokeWidth="2.5" fill="none" opacity="0.5"/>
        <path d="M 76 42 Q 100 37 124 43" stroke="#4a4a64" strokeWidth="1.5" fill="none" opacity="0.3"/>

        {/* ══ EYEBROWS ══ */}
        <motion.path
          animate={{ d: BROWS[emotion][0] }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          stroke="#2a2038" strokeWidth="2.2" strokeLinecap="round" fill="none"
        />
        <motion.path
          animate={{ d: BROWS[emotion][1] }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          stroke="#2a2038" strokeWidth="2.2" strokeLinecap="round" fill="none"
        />
        {emotion === "angry" && (
          <>
            <path d="M 80 62 Q 89 55 97 60 L 95 64 Q 87 59 82 66 Z" fill="#2a2038" opacity="0.4"/>
            <path d="M 103 60 Q 111 55 120 62 L 118 66 Q 110 59 105 64 Z" fill="#2a2038" opacity="0.4"/>
          </>
        )}

        {/* ══ EYES ══ */}
        {closed ? (
          /* laughing / squint */
          <>
            <path d="M 80 68 Q 87 75 94 68" stroke="#2a2038" strokeWidth="2.8" strokeLinecap="round" fill="none"/>
            <path d="M 106 68 Q 113 75 120 68" stroke="#2a2038" strokeWidth="2.8" strokeLinecap="round" fill="none"/>
          </>
        ) : (
          <>
            {/* ── left eye ── */}
            <motion.ellipse cx="87" rx="10"
              animate={{ ry: blink ? 1 : 8 * eyeOpen, cy: 68 + ety }}
              transition={{ duration: blink ? 0.07 : 0.28 }}
              fill="white"/>
            <motion.ellipse cx="87"
              animate={{ ry: blink ? 0 : 5.5 * eyeOpen, cy: 68 + ety }}
              transition={{ duration: 0.07 }}
              rx="5.5" fill={irisClr}/>
            <motion.circle cx="87"
              animate={{ cy: 68 + ety, r: blink ? 0 : 3 }}
              transition={{ duration: 0.07 }}
              fill="#100810"/>
            <motion.circle cx="90"
              animate={{ cy: 65 + ety, r: blink ? 0 : 1.8 }}
              fill="white" fillOpacity="0.95"/>
            <motion.circle cx="84.5"
              animate={{ cy: 70 + ety, r: blink ? 0 : 1 }}
              fill="white" fillOpacity="0.5"/>
            {/* upper lid */}
            <motion.path
              animate={{ d: blink ? "M 78 68 Q 87 68 96 68" : `M 78 ${61+ety} Q 87 ${57+ety} 96 ${61+ety}` }}
              stroke="#1c1428" strokeWidth="2.4" strokeLinecap="round" fill="none"/>
            {/* lash tips */}
            <motion.path
              animate={{ d: blink ? "M 78 68 L 76 68" : `M 78 ${61+ety} L 75 ${58+ety}` }}
              stroke="#1c1428" strokeWidth="1.6" strokeLinecap="round" fill="none"/>
            <motion.path
              animate={{ d: blink ? "M 96 68 L 98 68" : `M 96 ${61+ety} L 99 ${58+ety}` }}
              stroke="#1c1428" strokeWidth="1.6" strokeLinecap="round" fill="none"/>
            {/* lower lid */}
            <motion.path
              animate={{ d: blink ? "M 80 68 Q 87 68 94 68" : `M 80 ${76+ety} Q 87 ${79+ety} 94 ${76+ety}` }}
              stroke="#5a4038" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.35"/>

            {/* ── right eye ── */}
            <motion.ellipse cx="113" rx="10"
              animate={{ ry: blink ? 1 : 8 * eyeOpen, cy: 68 + ety }}
              transition={{ duration: blink ? 0.07 : 0.28 }}
              fill="white"/>
            <motion.ellipse cx="113"
              animate={{ ry: blink ? 0 : 5.5 * eyeOpen, cy: 68 + ety }}
              transition={{ duration: 0.07 }}
              rx="5.5" fill={irisClr}/>
            <motion.circle cx="113"
              animate={{ cy: 68 + ety, r: blink ? 0 : 3 }}
              transition={{ duration: 0.07 }}
              fill="#100810"/>
            <motion.circle cx="116"
              animate={{ cy: 65 + ety, r: blink ? 0 : 1.8 }}
              fill="white" fillOpacity="0.95"/>
            <motion.circle cx="110.5"
              animate={{ cy: 70 + ety, r: blink ? 0 : 1 }}
              fill="white" fillOpacity="0.5"/>
            <motion.path
              animate={{ d: blink ? "M 104 68 Q 113 68 122 68" : `M 104 ${61+ety} Q 113 ${57+ety} 122 ${61+ety}` }}
              stroke="#1c1428" strokeWidth="2.4" strokeLinecap="round" fill="none"/>
            <motion.path
              animate={{ d: blink ? "M 104 68 L 102 68" : `M 104 ${61+ety} L 101 ${58+ety}` }}
              stroke="#1c1428" strokeWidth="1.6" strokeLinecap="round" fill="none"/>
            <motion.path
              animate={{ d: blink ? "M 122 68 L 124 68" : `M 122 ${61+ety} L 125 ${58+ety}` }}
              stroke="#1c1428" strokeWidth="1.6" strokeLinecap="round" fill="none"/>
            <motion.path
              animate={{ d: blink ? "M 106 68 Q 113 68 120 68" : `M 106 ${76+ety} Q 113 ${79+ety} 120 ${76+ety}` }}
              stroke="#5a4038" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.35"/>
          </>
        )}

        {/* ══ NOSE ══ */}
        <ellipse cx="97" cy="80" rx="1.8" ry="2.5" fill="#c8906065"/>
        <ellipse cx="103" cy="80" rx="1.8" ry="2.5" fill="#c8906065"/>

        {/* ══ MOUTH with LIP SYNC ══ */}
        {mouthOpen < 0.08 ? (
          <motion.path
            animate={{ d: MOUTHS[emotion] }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            stroke={LIP} strokeWidth="2.2" strokeLinecap="round" fill="none"
          />
        ) : (
          <g>
            {/* mouth cavity */}
            <motion.path
              animate={{ d: mouthOpenFill(mouthOpen) }}
              transition={{ duration: 0.04 }}
              fill="#1a0808"/>
            {/* teeth */}
            {mouthOpen > 0.4 && (
              <motion.path
                animate={{ d: teethFill(mouthOpen) }}
                transition={{ duration: 0.04 }}
                fill="white" fillOpacity="0.9"/>
            )}
            {/* upper lip */}
            <motion.path
              animate={{ d: `M ${100-9-mouthOpen*4} 86 Q 100 84 ${100+9+mouthOpen*4} 86` }}
              transition={{ duration: 0.04 }}
              stroke={LIP} strokeWidth="2" strokeLinecap="round" fill="none"/>
            {/* lower lip */}
            <motion.path
              animate={{ d: `M ${100-9-mouthOpen*4} 86 Q ${100-10-mouthOpen*4} ${86+mouthOpen*12*0.55} 100 ${86+mouthOpen*12} Q ${100+10+mouthOpen*4} ${86+mouthOpen*12*0.55} ${100+9+mouthOpen*4} 86` }}
              transition={{ duration: 0.04 }}
              stroke="#b06050" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.65"/>
          </g>
        )}

        {/* ══ TEARS ══ */}
        {emotion === "crying" && (
          <>
            <motion.ellipse cx="84" rx="2.5" ry="4.5"
              animate={{ cy: [74, 92, 110] }}
              transition={{ duration: 1, repeat: Infinity, ease: "easeIn" }}
              fill="#93c5fd" fillOpacity="0.85"/>
            <motion.ellipse cx="116" rx="2.5" ry="4.5"
              animate={{ cy: [74, 92, 110] }}
              transition={{ duration: 1, repeat: Infinity, ease: "easeIn", delay: 0.4 }}
              fill="#93c5fd" fillOpacity="0.85"/>
          </>
        )}

        {/* ══ THINKING DOTS ══ */}
        {emotion === "thinking" && (
          <>
            {[{cx:144,cy:52,r:4.5,d:0},{cx:154,cy:42,r:3.2,d:0.4},{cx:162,cy:34,r:2.2,d:0.8}].map((b,i)=>(
              <motion.circle key={i} cx={b.cx} cy={b.cy} r={b.r} fill={GLOW_CLR.thinking}
                animate={{ opacity:[0.9,0.2,0.9], scale:[1,1.15,1] }}
                transition={{ duration:1.3, repeat:Infinity, delay:b.d }}/>
            ))}
          </>
        )}

        {/* ══ ANGRY VEIN ══ */}
        {emotion === "angry" && (
          <path d="M 55 50 Q 59 43 63 50 Q 59 57 55 50" fill="#ef444460"/>
        )}

        {/* ══ SPEAKING DOTS (below chin) ══ */}
        {speaking && (
          <>
            {[{cx:93,d:0},{cx:100,d:0.17},{cx:107,d:0.34}].map((s,i)=>(
              <motion.circle key={i} cx={s.cx} r="2.2" fill={GLOW_CLR[emotion]} fillOpacity="0.8"
                animate={{ cy:[108,103,108] }}
                transition={{ duration:0.5, repeat:Infinity, delay:s.d }}/>
            ))}
          </>
        )}

        {/* ══ GROUND SHADOW ══ */}
        <ellipse cx="100" cy="374" rx={sitting?45:34} ry="4" fill="#00000018"/>

      </svg>

      {/* ── emotion badge ── */}
      <AnimatePresence mode="wait">
        <motion.div key={emotion}
          initial={{ opacity:0, y:5, scale:0.8 }}
          animate={{ opacity:1, y:0,  scale:1   }}
          exit   ={{ opacity:0, y:-4, scale:0.8 }}
          className="absolute text-[11px] px-3 py-1 rounded-full text-white font-semibold pointer-events-none whitespace-nowrap"
          style={{
            bottom: 6,
            left:"50%", transform:"translateX(-50%)",
            background:`${GLOW_CLR[emotion]}dd`,
            backdropFilter:"blur(10px)",
          }}
        >
          {BADGE_TEXT[emotion]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
