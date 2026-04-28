# AiCoax — Complete Design Specification
> Paste this entire file into Claude to get a full redesign. All pages, colors, components, and layout patterns are documented here.

---

## 1. APP OVERVIEW
**Name:** AiCoax  
**Tagline:** Your mental health companion  
**Character:** Maya — an AI best friend (warm, funny, real). Not a therapist.  
**Platform:** Mobile-first PWA (Next.js), also works on desktop.

---

## 2. CURRENT COLOR PALETTE

### Dark Theme (default)
| Token | Hex | Usage |
|-------|-----|-------|
| Background | `#020617` (slate-950) | Page background |
| Surface | `#0f172a` (slate-900) | Cards, panels |
| Surface 2 | `#1e293b` (slate-800) | Inputs, secondary cards |
| Surface 3 | `#334155` (slate-700) | Hover states |
| Border | `#1e293b` (slate-800) | Card borders |
| Text primary | `#ffffff` | Headings, body |
| Text secondary | `#94a3b8` (slate-400) | Subtext |
| Text muted | `#64748b` (slate-500) | Placeholders, labels |
| Accent / CTA | `#14b8a6` (teal-500) | Primary buttons, focus rings |
| Accent hover | `#0d9488` (teal-600) | Button hover |
| Maya pink | `#f472b6` (pink-400) | Maya brand, highlights |
| Danger | `#ef4444` (red-500) | Crisis, errors |
| Warning | `#f59e0b` (amber-500) | Burnout, alerts |

### Theme Variants
- **Blush:** Deep magenta-black `#1a0210` bg, pink-tinted surfaces
- **Light:** `#f0f4f8` bg, white surfaces, navy text
- **Aurora, Lavender, Sunset, Ocean, Forest:** Dark gradient backgrounds

### Maya Emotion Glow Colors
```
neutral  → #60a5fa (blue)
happy    → #f472b6 (pink)
excited  → #fbbf24 (yellow)
sad      → #818cf8 (indigo)
coaxing  → #34d399 (green)
thinking → #a78bfa (purple)
blush    → #fb7185 (rose)
crying   → #93c5fd (light blue)
laughing → #fcd34d (amber)
angry    → #f87171 (red)
hug      → #f9a8d4 (soft pink)
```

---

## 3. TYPOGRAPHY
- **Font:** Geist Sans (system fallback: sans-serif)
- **Scale:**
  - Hero: `text-3xl font-bold` (30px)
  - Section heading: `text-2xl font-bold` (24px)
  - Card title: `text-sm font-semibold` (14px)
  - Body: `text-sm` (14px)
  - Caption: `text-xs` (12px)
  - Micro: `text-[10px]` (10px)
- **Fluid helpers:** `clamp(12px,2vw,14px)` → `clamp(24px,5vw,36px)`

---

## 4. COMPONENT LIBRARY

### Buttons
```
Primary CTA:    bg-teal-600 hover:bg-teal-500, rounded-xl/2xl, py-3/4, text-sm font-medium
Gradient CTA:   bg-gradient-to-r from-pink-500 to-rose-600, rounded-2xl, py-4, text-lg font-semibold
Ghost/Back:     border border-slate-700 text-slate-400 hover:text-white, rounded-2xl
Danger:         bg-red-600 hover:bg-red-500
Icon button:    p-2 rounded-lg bg-slate-700 hover:bg-slate-600
```

### Cards
```
Standard:       bg-slate-900 border border-slate-800 rounded-2xl p-4/5
Accent card:    bg-gradient-to-br from-teal-900/30 to-cyan-900/20 border border-teal-800/40
Selected state: border-teal-500 bg-teal-500/10
Hover:          hover:border-slate-600 hover:bg-slate-800/50 transition-all
```

### Inputs
```
Text input:     bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white 
                placeholder-slate-500 focus:border-teal-500 transition-colors
Textarea:       same + resize-none, min-h varies by page
```

### Badges / Pills
```
Tag:            bg-slate-800 text-slate-300 text-xs px-2.5 py-1 rounded-full
Selected tag:   bg-teal-500/20 text-teal-300 border border-teal-600/50
Mood dot:       w-2 h-2 rounded-full animate-pulse (color varies by value)
```

### Header (sticky top nav)
```
border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm px-4 sm:px-6 py-3
flex items-center gap-3 sticky top-0 z-10
Left: ArrowLeft icon link
Center: title (font-bold) + subtitle (text-xs text-slate-500)
Right: avatar emoji or action button
```

---

## 5. PAGE-BY-PAGE LAYOUT

### HOME / LANDING (`/`)
- Full-screen centered layout
- Large Maya avatar (160-200px circle, video)
- Headline + tagline
- Two CTA buttons: "Talk to Maya" (primary) + "Dashboard"
- Ambient glow behind avatar matching current emotion

### LOGIN (`/login`)
- Centered single-column, max-w-md
- Logo: 🌿 emoji + "AiCoax" h1 + tagline
- Demo account quick-select cards (avatar emoji + name + bio)
- Email/password form (2 inputs + submit)
- Guest continue link at bottom

### ONBOARDING (`/onboarding`)
- 7-step wizard with progress dots at top (active = wide teal, done = small teal, future = small slate)
- Steps: welcome → name → reason → mood → tone → notifications → meet Maya
- Each step slides in/out (Framer Motion `AnimatePresence`)
- **Welcome:** Maya avatar + greeting text + "Let's go →" gradient button
- **Name:** Centered text input, large placeholder
- **Reason:** 7 option cards in single column (emoji + label + desc), auto-advance on select
- **Mood:** 5 emoji buttons in a row, scale on select
- **Tone:** 2×2 grid of cards (emoji + label + desc)
- **Notifications:** Toggle card + time input (conditional)
- **Meet Maya:** Maya avatar (thinking while typing, happy when done) + AI-generated personal message in card + "Start talking" button

### DASHBOARD (`/dashboard`)
- Two-column on desktop (main + sidebar tools), single column on mobile
- **Stats row:** 3 cards — streak (🔥), avg mood (❤️), sessions (🧠)
- **Today mood:** Gradient card with emoji + score + "Update" link, or dashed "Log mood" prompt
- **7-day bar chart:** Animated bars, color-coded by mood score, weekday labels
- **Tools grid:** 13 tool cards, 2 columns mobile / list on desktop
  - Each: colored gradient icon square + label + subtitle + arrow

### MAYA CHAT (`/friend`)
- **Header:** Back + "Maya" title + "Best friend AI" sub + voice/settings controls
- **Avatar area:** Video circle (90px when chat exists, 150px when empty) + emotion glow
- **Conversation starters:** Horizontal scroll chips when no chat
- **Chat messages:**
  - User: right-aligned, bg-teal-600 bubble, rounded-2xl rounded-tr-sm
  - Maya: left-aligned, bg-slate-800 bubble, rounded-2xl rounded-tl-sm, with emotion avatar
- **Input bar:** Sticky bottom, textarea + mic button + send button
- **Voice mode:** Full-screen overlay, large Maya avatar (220px), waveform/status indicators, end call button
- **Quick replies:** Horizontal scroll chips for common phrases
- **Language picker:** Dropdown with 20 language options

### MOOD TRACKER (`/mood`)
- 10-point scale with emoji + color feedback
- Optional note textarea
- 7-day history chart
- Streak counter

### BREATHING EXERCISE (`/breathe`)
- Full-screen centered
- Animated breathing circle (CSS keyframes, scale 1→1.4 over 4s)
- "Inhale / Hold / Exhale" text with timer
- Ambient glow background

### JOURNAL (`/journal`)
- List view of past entries (date + preview)
- "New entry" button → textarea modal/page
- AI reflection: streams insight below entry
- Tags input

### CBT THERAPY (`/cbt`)
- Step-by-step thought record form
- Situation → Automatic thought → Evidence for/against → Balanced thought
- AI-powered reframing suggestion
- Past sessions list

### HABITS (`/habits`)
- Habit creation form (name + emoji + frequency)
- Daily checklist with streak badges
- Mood correlation insight card ("You feel 2pts better when you exercise")
- Weekly AI pattern insight

### GRATITUDE JOURNAL (`/gratitude`)
- Daily "3 things" card prompt
- Text inputs with emoji decorations
- Streak counter
- Weekly AI reflection on themes

### WELLBEING REPORT (`/report`)
- Stat cards: this week avg, vs last week, total entries
- 7-day bar chart
- 3-tab card: Overview / Patterns / Export
- AI-generated sections: summary, trend, strengths, challenges, suggestions, triggers, affirmation
- Copy-to-clipboard export button

### THERAPIST CONNECT (`/therapist`)
- Filter bar: price range, language, speciality
- 6 platform cards (iCall, YourDOST, Vandrevala, MindPeers, Wysa, BetterHelp India)
- Each card: logo area + name + description + languages + price + "Visit" button
- Maya recommendation panel (streams personalized suggestion)
- "Share my AiCoax report" modal

### PEER GROUPS (`/groups`)
- 5 room chips: Anxiety, Burnout, Grief, Students, Work Stress
- Selected room: scrollable chat messages
- Anonymous avatars (emoji) + anonymous name + timestamp
- Message input bar at bottom
- Maya moderation notice
- Realtime via Supabase (fallback: localStorage)

### CRISIS (`/crisis`)
- Red-accented urgent design
- Emergency resources list (iCall, Vandrevala helpline numbers)
- "You are not alone" messaging
- No chat — just contacts and grounding techniques

### PROFILE (`/profile`)
- Avatar picker
- Display name, preferred name (Maya calls me)
- Theme picker (7 options with preview swatches)
- Maya tone selector
- Language preference
- Notification time picker
- Danger zone: clear data, logout

### BURNOUT CHECK (`/burnout`)
- Multi-question assessment (sliders or 1-5 scale)
- Categories: Work, Personal, Physical, Emotional
- Score visualization (gauge or radar)
- AI interpretation + suggestions

### LEARN LIBRARY (`/understand`)
- Category tabs: Anxiety, Depression, CBT, Mindfulness, etc.
- Article cards (title + read time + emoji)
- Article view with back navigation

---

## 6. MAYA AVATAR SYSTEM
- **Format:** Looping MP4 video clips, one per emotion
- **Display:** Circular crop (`border-radius: 50%`), crossfade between clips
- **Size:** 90px (chat mode) / 150–220px (hero / voice call)
- **Glow:** `radial-gradient` behind circle, color changes per emotion (see section 2)
- **Speaking indicator:** Pulsing ring animation around circle when speaking
- **Loading state:** SVG circular progress ring showing % preloaded
- **Fallback:** Emoji in styled circle if videos unavailable
- **Clips:** neutral, happy, sad, excited, coaxing, thinking, blush, crying, laughing, angry, hug

---

## 7. ANIMATIONS
```
Page transitions:   opacity 0→1, x ±40 (Framer Motion)
Card hover:         scale-105, border color change
Button tap:         whileTap scale-0.96
Bar chart:          height 0→value (staggered, 0.06s delay each)
Maya glow:          transition: background 0.7s ease
Crossfade video:    opacity transition 0.38s ease
Breathing circle:   scale 1→1.4 over 4s ease-in-out infinite
Pulse ring:         scale 0.9→2.2, opacity 0.6→0, 2.5s infinite
Speaking pulse:     scale 1→1.05, opacity 0.2→0.9, 1.1s infinite
Float:              translateY 0→-8px, 4s ease-in-out infinite
```

---

## 8. RESPONSIVE BREAKPOINTS
- **Mobile:** < 640px — single column, full-width cards, compact header
- **Tablet (sm):** 640px+ — show subtitles on cards, larger spacing
- **Desktop (lg):** 1024px+ — two-column dashboard layout, sidebar tools list

---

## 9. NAVIGATION STRUCTURE
```
/              → Home / Landing
/login         → Login (public)
/onboarding    → Onboarding wizard (new users)
/dashboard     → Main dashboard
/friend        → Maya chat + voice call
/mood          → Mood tracker
/breathe       → Breathing exercise
/journal       → AI journal
/cbt           → CBT thought records
/burnout       → Burnout assessment
/habits        → Habit tracker
/gratitude     → Gratitude journal
/report        → Wellbeing report
/therapist     → Therapist directory
/groups        → Peer support groups
/crisis        → Crisis resources
/understand    → Mental health library
/profile       → Settings & profile
```

---

## 10. WHAT TO REDESIGN (BRIEF FOR CLAUDE)

The current design uses a dark slate color palette with teal accents. It's functional but feels generic. Please redesign with:

1. **Visual Identity** — More warmth, personality, and "friend" energy. Less clinical/dashboard-y.
2. **Maya's Presence** — Maya should feel alive throughout the app, not just on the chat page.
3. **Color System** — Keep dark mode as default but make it feel richer, more emotional (purples, warm blacks, soft pinks).
4. **Dashboard** — Less list-y grid, more of a "morning card" feel — what matters today, front and center.
5. **Chat Page** — More conversational, less chat-app-clone. Maya's messages should feel like handwritten notes.
6. **Onboarding** — More magical first impression, smoother transitions.
7. **Mobile polish** — Safe areas, thumb-friendly tap targets (min 44px), no horizontal scroll.
8. **Micro-interactions** — Haptic-like visual feedback, smoother transitions everywhere.

Keep: Next.js App Router + TypeScript + Tailwind CSS v4 + Framer Motion. No component library dependencies.
