"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export type Emotion =
  | "neutral" | "happy" | "sad" | "excited"
  | "coaxing" | "thinking" | "blush" | "crying"
  | "laughing" | "angry" | "hug";

export type MayaPose = "standing" | "sitting"; // kept for API compatibility

interface Props {
  emotion: Emotion;
  speaking: boolean;
  pose?: MayaPose;
  size?: number;
  /** Play the greeting/startup clip once on mount before switching to emotion */
  playGreeting?: boolean;
}

const EMOTIONS: Emotion[] = [
  "neutral","happy","sad","excited","coaxing",
  "thinking","blush","crying","laughing","angry","hug",
];

// Exact filenames that exist in /public/maya/
// Speaking variants only for emotions that have one
const SPEAKING_VARIANTS: Partial<Record<Emotion, string>> = {
  crying: "crying-speaking.mp4",
};

const BASE_CLIPS: Record<Emotion, string> = {
  neutral:  "neutral.mp4",
  happy:    "happy.mp4",
  sad:      "sad.mp4",
  excited:  "excited.mp4",
  coaxing:  "coaxing.mp4",
  thinking: "thinking.mp4",
  blush:    "blush.mp4",
  crying:   "crying.mp4",
  laughing: "laughing.mp4",
  angry:    "angry.mp4",
  hug:      "hug.mp4",
};

const GREETING_CLIP = "excited.mp4"; // plays on first load / onboarding intro

// Build the full preload list — only files that actually exist
const ALL_CLIPS: string[] = [
  ...EMOTIONS.map(e => BASE_CLIPS[e]),
  ...Object.values(SPEAKING_VARIANTS),
];

const CACHE_NAME = "maya-clips-v2"; // bump version when clips are added/changed

const GLOW: Record<Emotion, string> = {
  neutral:  "#60a5fa",
  happy:    "#f472b6",
  excited:  "#fbbf24",
  sad:      "#818cf8",
  coaxing:  "#34d399",
  thinking: "#a78bfa",
  blush:    "#fb7185",
  crying:   "#93c5fd",
  laughing: "#fcd34d",
  angry:    "#f87171",
  hug:      "#f9a8d4",
};

/* ─── Cache API helpers ───────────────────────────────────── */

async function purgeStaleCaches() {
  try {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith("maya-clips-") && k !== CACHE_NAME).map(k => caches.delete(k)));
  } catch {}
}

async function getCachedBlobUrl(filename: string): Promise<string | null> {
  const url = `/maya/${filename}`;
  try {
    const cache = await caches.open(CACHE_NAME);
    const hit   = await cache.match(url);

    if (hit) {
      const blob = await hit.blob();
      if (blob.size > 0) return URL.createObjectURL(blob);
    }

    // Not cached — fetch from server
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;

    await cache.put(url, res.clone());
    const blob = await res.blob();
    return blob.size > 0 ? URL.createObjectURL(blob) : null;
  } catch {
    return null;
  }
}

/* ─── Module-level store — persists across re-renders ──────── */
const blobStore: Record<string, string> = {};
let preloadPromise: Promise<void> | null = null;

async function preloadAllClips(onProgress?: (done: number, total: number) => void) {
  if (preloadPromise) return preloadPromise;
  preloadPromise = (async () => {
    await purgeStaleCaches(); // clear old cache versions
    let done = 0;
    const total = ALL_CLIPS.length;
    // Load neutral first so the avatar shows immediately
    const prioritised = [
      "neutral.mp4",
      ...ALL_CLIPS.filter(c => c !== "neutral.mp4"),
    ];
    // Batches of 3 parallel downloads
    const BATCH = 3;
    for (let i = 0; i < prioritised.length; i += BATCH) {
      await Promise.all(
        prioritised.slice(i, i + BATCH).map(async (name) => {
          const blobUrl = await getCachedBlobUrl(name);
          if (blobUrl) blobStore[name] = blobUrl;
          onProgress?.(++done, total);
        })
      );
    }
  })();
  return preloadPromise;
}

function resolveClip(emotion: Emotion, speaking: boolean): string | null {
  if (speaking) {
    const sv = SPEAKING_VARIANTS[emotion];
    if (sv && blobStore[sv]) return blobStore[sv];
  }
  const base = BASE_CLIPS[emotion];
  if (blobStore[base]) return blobStore[base];
  if (blobStore["neutral.mp4"]) return blobStore["neutral.mp4"];
  return null;
}

// Fetch a single clip on-demand (for clips added after initial cache build)
async function fetchClipOnDemand(emotion: Emotion): Promise<string | null> {
  const filename = BASE_CLIPS[emotion];
  if (!filename) return null;
  if (blobStore[filename]) return blobStore[filename]; // already loaded
  const url = await getCachedBlobUrl(filename);
  if (url) blobStore[filename] = url;
  return url ?? null;
}

/* ─── Component ───────────────────────────────────────────── */
export default function MayaAvatar({ emotion, speaking, size = 200, playGreeting = false }: Props) {
  const vidA = useRef<HTMLVideoElement>(null);
  const vidB = useRef<HTMLVideoElement>(null);
  const activeRef = useRef<"A" | "B">("A");

  const [preloadDone,  setPreloadDone]  = useState(Object.keys(blobStore).length > 0);
  const [preloadPct,   setPreloadPct]   = useState(0);
  const [showFallback, setShowFallback] = useState(false);
  const [opacity,      setOpacity]      = useState({ A: 1, B: 0 });
  const greetingPlayed = useRef(false);

  /* ── Preload all clips on mount ── */
  useEffect(() => {
    if (typeof caches === "undefined") { setShowFallback(true); return; }
    if (preloadDone) return;

    preloadAllClips((done, total) => {
      setPreloadPct(Math.round((done / total) * 100));
    }).then(() => {
      if (Object.keys(blobStore).length === 0) {
        setShowFallback(true);
      } else {
        setPreloadDone(true);
      }
    });
  }, [preloadDone]);

  /* ── Crossfade to a new clip ── */
  const crossfadeTo = useCallback((blobUrl: string) => {
    const current = activeRef.current;
    const next    = current === "A" ? "B" : "A";
    const nextVid = next === "A" ? vidA.current : vidB.current;
    if (!nextVid) return;

    nextVid.src         = blobUrl;
    nextVid.currentTime = 0;
    nextVid.load();

    nextVid.oncanplay = () => {
      nextVid.play().catch(() => {});
      setOpacity(next === "A" ? { A: 1, B: 0 } : { A: 0, B: 1 });

      // Pause old video after crossfade
      setTimeout(() => {
        const oldVid = current === "A" ? vidA.current : vidB.current;
        oldVid?.pause();
      }, 380);

      activeRef.current = next;
      nextVid.oncanplay = null;
    };
  }, []);

  /* ── Boot: play greeting then switch to emotion ── */
  useEffect(() => {
    if (!preloadDone) return;

    const startClip = resolveClip("neutral", false);
    if (!startClip) { setShowFallback(true); return; }

    // Seed video A with neutral immediately
    if (vidA.current) {
      vidA.current.src = startClip;
      vidA.current.load();
      vidA.current.play().catch(() => {});
      setOpacity({ A: 1, B: 0 });
    }

    // Optionally play the greeting clip, then settle into emotion
    if (playGreeting && !greetingPlayed.current) {
      greetingPlayed.current = true;
      const gClip = blobStore[GREETING_CLIP];
      if (gClip) {
        setTimeout(() => crossfadeTo(gClip), 300);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preloadDone]);

  /* ── Emotion / speaking changes → crossfade ── */
  useEffect(() => {
    if (!preloadDone) return;
    const url = resolveClip(emotion, speaking);
    if (url) { crossfadeTo(url); return; }
    // Clip not in blobStore yet — fetch on demand (handles newly added clips like hug)
    fetchClipOnDemand(emotion).then(onDemandUrl => {
      if (onDemandUrl) crossfadeTo(onDemandUrl);
    });
  }, [emotion, speaking, preloadDone, crossfadeTo]);

  const dim       = size;
  const glowColor = GLOW[emotion];

  /* ── Loading ring ── */
  if (!preloadDone && !showFallback) {
    const circumference = 2 * Math.PI * 47;
    return (
      <div style={{ width: dim, height: dim, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <div style={{
          width: dim * 0.72, height: dim * 0.72, borderRadius: "50%",
          background: "linear-gradient(135deg,#1e293b,#0f172a)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: dim * 0.28, position: "relative",
        }}>
          🧡
          <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%" }} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="47" fill="none" stroke="#1e293b" strokeWidth="5"/>
            <circle cx="50" cy="50" r="47" fill="none" stroke="#14b8a6" strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - preloadPct / 100)}
              style={{ transformOrigin:"center", transform:"rotate(-90deg)", transition:"stroke-dashoffset 0.4s ease" }}
            />
          </svg>
        </div>
        <p style={{ color:"#64748b", fontSize:10, margin:0, letterSpacing:"0.05em" }}>
          Loading Maya {preloadPct}%
        </p>
      </div>
    );
  }

  /* ── Emoji fallback (no clips at all) ── */
  if (showFallback) {
    const EMOJI: Partial<Record<Emotion,string>> = {
      happy:"😊", sad:"😢", excited:"🤩", coaxing:"💪",
      thinking:"🤔", blush:"🥰", crying:"😭", laughing:"😂", angry:"😤", hug:"🫂",
    };
    return (
      <div style={{ width:dim, height:dim, position:"relative", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ position:"absolute", inset:0, borderRadius:"50%",
          background:`radial-gradient(circle,${glowColor}33 0%,transparent 70%)`,
          transition:"background 0.6s ease" }} />
        <div style={{
          width:dim*0.72, height:dim*0.72, borderRadius:"50%",
          background:"linear-gradient(135deg,#c68642,#a0522d)",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:dim*0.32, userSelect:"none",
          boxShadow:`0 0 ${dim*0.18}px ${glowColor}66`, transition:"box-shadow 0.5s ease",
        }}>
          {EMOJI[emotion] ?? "🧡"}
        </div>
        {speaking && (
          <div style={{ position:"absolute", bottom:dim*0.04, left:"50%", transform:"translateX(-50%)", display:"flex", gap:5 }}>
            {[0,1,2].map(i=>(
              <div key={i} style={{ width:7, height:7, borderRadius:"50%", background:glowColor,
                animation:`mb 0.6s ease-in-out ${i*0.15}s infinite alternate` }}/>
            ))}
          </div>
        )}
        <style>{`@keyframes mb{from{transform:translateY(0)}to{transform:translateY(-7px)}}`}</style>
      </div>
    );
  }

  /* ── Main: dual-video crossfade player ── */
  return (
    <div style={{ width:dim, height:dim, position:"relative", display:"flex", alignItems:"center", justifyContent:"center" }}>
      {/* Ambient glow */}
      <div style={{
        position:"absolute", inset:"-14%", borderRadius:"50%",
        background:`radial-gradient(circle,${glowColor}40 0%,transparent 65%)`,
        transition:"background 0.7s ease", pointerEvents:"none", zIndex:0,
      }}/>

      {/* Layer A */}
      <video ref={vidA} autoPlay loop muted playsInline
        style={{
          position:"absolute", width:dim, height:dim,
          objectFit:"cover", borderRadius:"50%",
          opacity:opacity.A, transition:"opacity 0.38s ease", zIndex:1,
        }}
      />

      {/* Layer B */}
      <video ref={vidB} autoPlay loop muted playsInline
        style={{
          position:"absolute", width:dim, height:dim,
          objectFit:"cover", borderRadius:"50%",
          opacity:opacity.B, transition:"opacity 0.38s ease", zIndex:2,
        }}
      />

      {/* Speaking pulse ring */}
      {speaking && (
        <div style={{
          position:"absolute", inset:-6, borderRadius:"50%",
          border:`2.5px solid ${glowColor}`,
          animation:"sp 1.1s ease-in-out infinite",
          zIndex:3, pointerEvents:"none",
        }}/>
      )}

      <style>{`
        @keyframes sp {
          0%,100%{ opacity:0.2; transform:scale(1); }
          50%    { opacity:0.9; transform:scale(1.05); }
        }
      `}</style>
    </div>
  );
}
