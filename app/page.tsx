"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/AppProviders";
import MayaAvatar from "@/components/MayaAvatar";

// ── Palette ──────────────────────────────────────────────────
const P = {
  bg0: "#1a0a1f",
  bg1: "#241027",
  bg2: "#2e1532",
  surface: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.08)",
  text: "#fbeef5",
  textDim: "#c9adc4",
  textMute: "#8a6e87",
  pink: "#f472b6",
  pinkSoft: "#fb7185",
  teal: "#5eead4",
  tealSoft: "#34d399",
  amber: "#fbbf24",
  indigo: "#a78bfa",
};

// ── Typed Greeting ───────────────────────────────────────────
function TypedGreeting({ name }: { name: string }) {
  const lines = [
    `Hi ${name}, nice to meet you.`,
    `We'll go along every way —`,
    `today's going to be good.`,
  ];
  const [shown, setShown] = useState(["", "", ""]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let li = 0, ci = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      if (li >= lines.length) { setDone(true); return; }
      const cur = lines[li];
      if (ci <= cur.length) {
        setShown(s => { const n = [...s]; n[li] = cur.slice(0, ci); return n; });
        ci++;
        timer = setTimeout(tick, 38);
      } else {
        li++; ci = 0;
        timer = setTimeout(tick, 380);
      }
    };
    timer = setTimeout(tick, 700);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  const activeLineIdx = shown.findIndex((l, i) => i < lines.length && l.length < lines[i].length);

  return (
    <div style={{
      fontFamily: "var(--font-instrument-serif), Georgia, serif",
      fontSize: "clamp(26px, 6vw, 34px)",
      lineHeight: 1.18,
      color: P.text,
      letterSpacing: "-0.015em",
      textAlign: "center",
      maxWidth: 320,
      minHeight: 130,
    }}>
      {shown.map((l, i) => (
        <div key={i} style={{
          opacity: l ? 1 : 0.3,
          color: i === 0 ? P.text : P.textDim,
          fontStyle: i === 1 ? "italic" : "normal",
        }}>
          {l}
          {!done && i === activeLineIdx && (
            <span style={{
              display: "inline-block", width: 2, height: "0.9em",
              background: P.pink, marginLeft: 2,
              animation: "caret 0.7s steps(2) infinite",
              verticalAlign: "text-bottom",
            }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Feature card visuals ─────────────────────────────────────
function BreatheVisual() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 70% 50%, ${P.tealSoft}30, transparent 60%)` }} />
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          position: "absolute", top: "50%", left: "50%",
          width: 80 + i * 50, height: 80 + i * 50,
          marginLeft: -(40 + i * 25), marginTop: -(40 + i * 25),
          borderRadius: "50%",
          border: `1px solid ${P.tealSoft}${i === 0 ? "99" : i === 1 ? "55" : "22"}`,
          animation: `breathePulse 4s ease-in-out infinite`,
          animationDelay: `${i * 0.8}s`,
        }} />
      ))}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        width: 60, height: 60, marginLeft: -30, marginTop: -30,
        borderRadius: "50%",
        background: `radial-gradient(circle at 35% 30%, #fff, ${P.tealSoft})`,
        boxShadow: `0 0 24px ${P.tealSoft}aa`,
      }} />
    </div>
  );
}

function ReportVisual() {
  const bars = [0.42, 0.65, 0.38, 0.78, 0.55, 0.85, 0.7];
  return (
    <div style={{ position: "absolute", inset: 0, padding: "20px 16px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 5 }}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, ${P.indigo}22, transparent 50%)` }} />
      {bars.map((h, i) => (
        <div key={i} style={{
          flex: 1, height: `${h * 100}%`, borderRadius: 4,
          background: `linear-gradient(180deg, ${P.pinkSoft}, ${P.indigo})`,
          opacity: 0.55 + h * 0.4,
          animation: `barRise 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) backwards`,
          animationDelay: `${i * 0.07}s`,
          transformOrigin: "bottom",
        }} />
      ))}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
        <path d="M 12 70% Q 35% 55%, 50% 45% T 95% 25%" stroke={P.text} strokeWidth="1.2" fill="none" strokeDasharray="3 3" opacity="0.5"/>
      </svg>
    </div>
  );
}

function BurnoutVisual() {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 80%, ${P.amber}22, transparent 60%)` }} />
      <svg width="160" height="100" viewBox="0 0 160 100">
        <defs>
          <linearGradient id="burn-grad" x1="0" x2="1">
            <stop offset="0" stopColor={P.tealSoft}/>
            <stop offset="0.5" stopColor={P.amber}/>
            <stop offset="1" stopColor={P.pinkSoft}/>
          </linearGradient>
        </defs>
        <path d="M 15 90 A 65 65 0 0 1 145 90" stroke={P.border} strokeWidth="14" fill="none" strokeLinecap="round"/>
        <path d="M 15 90 A 65 65 0 0 1 145 90" stroke="url(#burn-grad)" strokeWidth="14" fill="none" strokeLinecap="round" strokeDasharray="204" strokeDashoffset="68"/>
        <line x1="80" y1="90" x2="120" y2="42" stroke={P.text} strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="80" cy="90" r="6" fill={P.text}/>
        <circle cx="80" cy="90" r="3" fill={P.bg1}/>
      </svg>
      <div style={{
        position: "absolute", bottom: 14, left: 0, right: 0, textAlign: "center",
        fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase",
        color: P.textDim, fontWeight: 600,
      }}>Moderate</div>
    </div>
  );
}

function TherapistVisual() {
  const dots = [
    { x: 22, y: 30, c: P.pink },
    { x: 65, y: 22, c: P.tealSoft },
    { x: 80, y: 58, c: P.indigo },
    { x: 35, y: 70, c: P.amber },
    { x: 50, y: 45, c: P.pinkSoft },
  ];
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 30% 30%, ${P.pink}22, transparent 60%)` }} />
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        {dots.slice(0, -1).map((d, i) => {
          const next = dots[(i + 1) % dots.length];
          return <line key={i} x1={`${d.x}%`} y1={`${d.y}%`} x2={`${next.x}%`} y2={`${next.y}%`} stroke={P.border} strokeWidth="1" strokeDasharray="2 3"/>;
        })}
      </svg>
      {dots.map((d, i) => (
        <div key={i} style={{
          position: "absolute", left: `${d.x}%`, top: `${d.y}%`,
          width: 26, height: 26, marginLeft: -13, marginTop: -13,
          borderRadius: "50%",
          background: `radial-gradient(circle at 30% 30%, #fff, ${d.c})`,
          boxShadow: `0 0 16px ${d.c}88, 0 0 0 2px ${P.bg1}`,
          animation: `nodeBob 3s ease-in-out infinite`,
          animationDelay: `${i * 0.3}s`,
        }} />
      ))}
    </div>
  );
}

// ── Feature Card ─────────────────────────────────────────────
const FEATURES = [
  { id: "breathe", tag: "Calm", title: "Breathing room", subtitle: "4-7-8, box breath, or just follow the bloom.", accent: P.tealSoft, href: "/breathe" },
  { id: "report",  tag: "Clarity", title: "Wellbeing report", subtitle: "Weekly patterns, written by Maya.", accent: P.indigo, href: "/report" },
  { id: "burnout", tag: "Check-in", title: "Burnout check", subtitle: "A 2-minute pulse on how you're really doing.", accent: P.amber, href: "/burnout" },
  { id: "therapist", tag: "Connect", title: "Find a therapist", subtitle: "Vetted Indian platforms, in your language.", accent: P.pink, href: "/therapist" },
] as const;

const VISUALS: Record<string, () => React.JSX.Element> = {
  breathe: BreatheVisual,
  report: ReportVisual,
  burnout: BurnoutVisual,
  therapist: TherapistVisual,
};

function FeatureCard({ feature, wide }: { feature: typeof FEATURES[number]; wide?: boolean }) {
  const [hovered, setHovered] = useState(false);
  const Visual = VISUALS[feature.id];
  const aspect = wide ? "16/10" : "4/5";

  return (
    <a href={feature.href} style={{
      gridColumn: wide ? "span 2" : "span 1",
      borderRadius: 22, overflow: "hidden",
      background: P.surface,
      border: `1px solid ${hovered ? feature.accent : P.border}`,
      backdropFilter: "blur(20px)",
      position: "relative",
      aspectRatio: aspect,
      display: "flex", flexDirection: "column",
      cursor: "pointer",
      textDecoration: "none",
      transform: hovered ? "translateY(-4px)" : "translateY(0)",
      transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.3s",
    }}
    onMouseEnter={() => setHovered(true)}
    onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        flex: 1, position: "relative", overflow: "hidden",
        background: `linear-gradient(135deg, ${P.bg2}, ${P.bg1})`,
      }}>
        <Visual />
      </div>
      <div style={{
        padding: "14px 16px",
        display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10,
        borderTop: `1px solid ${P.border}`,
        background: `linear-gradient(180deg, transparent, ${P.bg0}80)`,
      }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: feature.accent, fontWeight: 700, marginBottom: 4 }}>{feature.tag}</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: P.text, letterSpacing: "-0.01em", marginBottom: 2 }}>{feature.title}</div>
          <div style={{ fontSize: 12, color: P.textDim, lineHeight: 1.35 }}>{feature.subtitle}</div>
        </div>
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          background: P.surface, border: `1px solid ${P.border}`,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M3 9L9 3M9 3H4M9 3v5" stroke={feature.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </a>
  );
}

// ── Bottom Nav ────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "home",    label: "Home",    href: "/" },
  { id: "maya",    label: "Maya",    href: "/friend" },
  { id: "burnout", label: "Burnout", href: "/burnout" },
  { id: "breathe", label: "Breathe", href: "/breathe" },
  { id: "profile", label: "You",     href: "/profile" },
];

function NavIcon({ id, color, size = 22 }: { id: string; color: string; size?: number }) {
  const icons: Record<string, React.ReactNode> = {
    home:    <path d="M3 11l9-7 9 7v9a2 2 0 01-2 2h-4v-7h-6v7H5a2 2 0 01-2-2v-9z" strokeLinejoin="round" strokeLinecap="round"/>,
    maya:    <><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="8" strokeDasharray="2 3"/></>,
    burnout: <><path d="M12 2c0 0-4 4-4 8a4 4 0 008 0c0-4-4-8-4-8z" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 12v4M10 18h4" strokeLinecap="round"/></>,
    breathe: <><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="8" opacity="0.4"/></>,
    profile: <><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" strokeLinecap="round"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7">
      {icons[id]}
    </svg>
  );
}

function BottomNav({ active }: { active: string }) {
  return (
    <div style={{ position: "fixed", bottom: 14, left: 14, right: 14, zIndex: 100, pointerEvents: "none" }}>
      <div style={{ position: "relative", borderRadius: 32, overflow: "hidden", pointerEvents: "auto" }}>
        {/* glass layers */}
        <div style={{
          position: "absolute", inset: 0, borderRadius: 32,
          backdropFilter: "blur(28px) saturate(180%)",
          WebkitBackdropFilter: "blur(28px) saturate(180%)",
          background: "rgba(255,255,255,0.08)",
        }} />
        <div style={{
          position: "absolute", inset: 0, borderRadius: 32,
          background: "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.02) 50%, rgba(255,255,255,0.06) 100%)",
        }} />
        <div style={{
          position: "absolute", inset: 0, borderRadius: 32,
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(0,0,0,0.18), 0 12px 32px rgba(0,0,0,0.35)",
          border: "0.5px solid rgba(255,255,255,0.12)",
        }} />
        <div style={{
          position: "relative", zIndex: 1,
          display: "flex", alignItems: "center", justifyContent: "space-around",
          padding: "10px 6px",
        }}>
          {NAV_ITEMS.map(it => {
            const isActive = active === it.id;
            return (
              <a key={it.id} href={it.href} style={{
                background: "none", border: "none", cursor: "pointer",
                padding: "8px 10px", borderRadius: 22,
                display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                fontFamily: "inherit", textDecoration: "none",
                position: "relative",
              }}>
                {isActive && (
                  <div style={{
                    position: "absolute", inset: 0, borderRadius: 22,
                    background: `linear-gradient(135deg, ${P.pink}, ${P.pinkSoft})`,
                    boxShadow: `0 4px 14px ${P.pink}66, inset 0 1px 0 rgba(255,255,255,0.3)`,
                    zIndex: -1,
                  }}/>
                )}
                <NavIcon id={it.id} color={isActive ? "#fff" : P.textDim} size={21}/>
                <span style={{
                  fontSize: 9.5, fontWeight: 600,
                  color: isActive ? "#fff" : P.textMute,
                  letterSpacing: "0.02em",
                }}>{it.label}</span>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────
export default function HomePage() {
  const { user, authReady } = useApp();
  const router = useRouter();
  const featuresRef = useRef<HTMLDivElement>(null);

  const name = user?.name?.split(" ")[0] ?? "friend";

  if (!authReady) return null;

  return (
    <div style={{
      minHeight: "100vh",
      background: `
        radial-gradient(ellipse 100% 50% at 50% 0%, ${P.pink}20, transparent 50%),
        radial-gradient(ellipse 80% 60% at 80% 110%, ${P.indigo}25, transparent 60%),
        linear-gradient(180deg, ${P.bg0}, ${P.bg1})
      `,
      color: P.text,
      fontFamily: "var(--font-geist-sans), -apple-system, system-ui, sans-serif",
      overflowX: "hidden",
    }}>

      {/* ── HERO ── */}
      <section style={{
        minHeight: "100svh",
        padding: "env(safe-area-inset-top, 60px) 24px 140px",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "space-between",
        gap: 24,
      }}>
        {/* brand badge */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "6px 14px", borderRadius: 999,
          background: P.surface, border: `1px solid ${P.border}`,
          backdropFilter: "blur(12px)",
          fontSize: 11, color: P.textDim,
          letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: P.tealSoft, boxShadow: `0 0 8px ${P.tealSoft}` }} />
          AiCoax · home
        </div>

        {/* Maya orb + greeting */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 28 }}>
          {/* Maya video avatar with orb glow behind */}
          <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {/* outer breathing glow */}
            <div style={{
              position: "absolute", inset: "-55%", borderRadius: "50%",
              background: `radial-gradient(circle, ${P.pink}55 0%, ${P.pink}22 35%, transparent 70%)`,
              filter: "blur(20px)",
              animation: "mayaGlow 4.5s ease-in-out infinite",
            }} />
            {/* pulse ring */}
            <div style={{
              position: "absolute", inset: "-18%", borderRadius: "50%",
              border: `1.5px solid ${P.pink}55`,
              animation: "mayaRing 3s ease-out infinite",
            }} />
            <div style={{ animation: "mayaFloat 5.5s ease-in-out infinite", position: "relative", zIndex: 1 }}>
              <MayaAvatar emotion="happy" speaking={false} size={170} />
            </div>
          </div>

          <TypedGreeting name={name} />
        </div>

        {/* speciality + CTA */}
        <div style={{ textAlign: "center", maxWidth: 300, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <div style={{ fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: P.textMute, fontWeight: 600 }}>
            Our speciality
          </div>
          <div style={{
            fontFamily: "var(--font-instrument-serif), Georgia, serif",
            fontSize: 22, lineHeight: 1.25, fontStyle: "italic",
            color: P.text, letterSpacing: "-0.01em",
          }}>
            Your AI best friend<br/>for mental health.
          </div>
          <button
            onClick={() => router.push("/friend")}
            style={{
              marginTop: 10, padding: "14px 32px", borderRadius: 999, border: "none",
              background: `linear-gradient(135deg, ${P.pink} 0%, ${P.pinkSoft} 100%)`,
              color: "#fff", fontWeight: 600, fontSize: 15,
              letterSpacing: "-0.01em",
              boxShadow: `0 8px 24px ${P.pink}55, inset 0 1px 0 rgba(255,255,255,0.3)`,
              cursor: "pointer", fontFamily: "inherit",
            }}>
            Talk to Maya  →
          </button>
        </div>

        {/* scroll cue */}
        <button
          onClick={() => featuresRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
          style={{
            marginTop: 8, background: "none", border: "none", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
            color: P.textMute, fontFamily: "inherit",
            animation: "scrollHint 2.4s ease-in-out infinite",
          }}>
          <span style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600 }}>
            What else
          </span>
          <svg width="20" height="22" viewBox="0 0 20 22" fill="none">
            <path d="M10 2v17M3 12l7 7 7-7" stroke={P.textDim} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </section>

      {/* ── FEATURES ── */}
      <div ref={featuresRef} />
      <div style={{ padding: "40px 24px 22px" }}>
        <div style={{ fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: P.textMute, fontWeight: 600, marginBottom: 10 }}>
          And when you need more
        </div>
        <div style={{
          fontFamily: "var(--font-instrument-serif), Georgia, serif",
          fontSize: 30, lineHeight: 1.1, color: P.text, letterSpacing: "-0.02em",
        }}>
          Maya brings <span style={{ fontStyle: "italic", color: P.pink }}>tools</span><br/>
          for the in-between.
        </div>
      </div>

      {/* collage grid: wide, narrow / narrow, wide */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: "0 16px" }}>
        <FeatureCard feature={FEATURES[0]} wide />
        <FeatureCard feature={FEATURES[1]} />
        <FeatureCard feature={FEATURES[2]} />
        <FeatureCard feature={FEATURES[3]} wide />
      </div>

      {/* footer */}
      <div style={{
        padding: "40px 24px 140px", textAlign: "center",
        color: P.textMute, fontSize: 11, letterSpacing: "0.18em",
        textTransform: "uppercase", fontWeight: 600,
      }}>
        AiCoax · made with care
      </div>

      {/* ── BOTTOM NAV ── */}
      <BottomNav active="home" />

      <style>{`
        @keyframes caret { 0%,50%{opacity:1} 50.01%,100%{opacity:0} }
        @keyframes mayaGlow { 0%,100%{opacity:0.7;transform:scale(1)} 50%{opacity:1;transform:scale(1.08)} }
        @keyframes mayaRing { 0%{transform:scale(0.92);opacity:0.7} 100%{transform:scale(1.45);opacity:0} }
        @keyframes mayaFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes scrollHint { 0%,100%{transform:translateY(0);opacity:0.55} 50%{transform:translateY(4px);opacity:1} }
        @keyframes breathePulse { 0%,100%{transform:scale(1);opacity:0.5} 50%{transform:scale(1.15);opacity:0.9} }
        @keyframes barRise { from{transform:scaleY(0);opacity:0} to{transform:scaleY(1);opacity:1} }
        @keyframes nodeBob { 0%,100%{transform:translate(0,0)} 50%{transform:translate(0,-3px)} }
      `}</style>
    </div>
  );
}
