# 🧠 AiCoax — AI Mental Health Companion

> **Hackathon Track 2.2 — Neuroscience & Mental Health**  
> Built with Next.js 16 · Claude API · Framer Motion · Web Speech API

---

## ✨ What is Reflect?

AiCoax is a full-stack AI mental wellness companion that combines evidence-based tools with a deeply human AI friend experience. It bridges the gap between emotional struggle and real professional help — available 24/7, stigma-free, and in your language.

> **Not a therapist. Not just a chatbot. A companion when it matters most.**

---

## 🚀 Live Features

### 🧡 Maya — AI Best Friend
- Full-body **anime SVG avatar** with 10 animated expressions
- **Lip-sync animation** — mouth moves in real-time as she speaks
- **Sitting/standing pose transitions** — sits in chair to listen, stands to greet
- **19 language support** — Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi + 10 international languages
- **Voice output** — sweet Indian female voice (Veena/Heera) with natural pitch variation
- **Voice input** — speak to Maya in your chosen language
- **Emotion-reactive** — Claude prepends `[emotion]` tags; avatar reacts live
- Chat history saved to `localStorage`

### 🌬️ Breathe
- 3 guided breathing exercises: **4-7-8**, **Box Breathing**, **Belly Breathing**
- Animated expanding circle with SVG progress ring
- Cycle counter and phase labels

### 📘 Learn (Mental Health Library)
- 6 topic modules: **Anxiety · Depression · Burnout · Stress · Sleep · Connection**
- Slide-based lessons with emoji visuals and progress dots
- No API calls — fully local content

### 💙 Mood Tracker
- 10-point mood scale with emoji representations
- Emotion tag pills (anxious, sad, grateful, etc.)
- Personal note field
- **7-day bar chart** visualization
- Full history list

### 🧠 CBT (Cognitive Behavioral Therapy)
- 4-step guided thought record: Situation → Thought → Emotion → Analysis
- AI identifies cognitive distortions with colour-coded labels
- Evidence For / Against grid
- Sessions saved to `localStorage`

### 🔥 Burnout Assessment
- 8-question **Maslach Burnout Inventory** (0–4 scale)
- Animated question transitions
- Dimension bars: Exhaustion · Cynicism · Efficacy
- Personalized **7-day recovery plan**
- History saved to `localStorage`

### 📓 Journal
- Write tab with AI-generated reflection insight (streamed)
- 12 random prompts to spark writing
- History tab with expandable entries and delete
- Sessions saved to `localStorage`

### 🚨 Crisis Resources
- 5 India helplines: **iCall · Vandrevala · NIMHANS · AASRA · Snehi**
- 3 global resources
- **5-4-3-2-1 Grounding Technique** interactive guide

### 📊 Dashboard
- 3-stat overview: **Streak · Avg Mood (7d) · Total Sessions**
- Today's mood card with update link
- 7-day animated mood bar chart
- Quick-access grid to all 8 tools

---

## 🗂️ Project Structure

```
reflect/
├── app/
│   ├── page.tsx              # Main companion chat (Reflect AI)
│   ├── friend/page.tsx       # Maya AI friend
│   ├── breathe/page.tsx      # Breathing exercises
│   ├── understand/page.tsx   # Mental health library
│   ├── mood/page.tsx         # Mood tracker
│   ├── cbt/page.tsx          # CBT thought records
│   ├── burnout/page.tsx      # Burnout assessment
│   ├── journal/page.tsx      # AI-guided journaling
│   ├── crisis/page.tsx       # Crisis resources
│   ├── dashboard/page.tsx    # Overview dashboard
│   └── api/
│       ├── companion/        # Therapeutic AI (claude-sonnet-4-6)
│       ├── friend/           # Maya friend AI + language routing
│       ├── cbt/              # CBT analysis (JSON response)
│       ├── burnout/          # Burnout scoring (JSON response)
│       └── journal/          # Journal reflection (streamed)
├── components/
│   └── MayaAvatar.tsx        # Full-body SVG avatar, 10 emotions, lip sync
└── lib/
    ├── mood.ts               # Mood CRUD (localStorage)
    └── prompts.ts            # AI system prompts
```

---

## ⚙️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| AI | Anthropic Claude API (`claude-sonnet-4-6`) |
| Animation | Framer Motion (SVG morphing, AnimatePresence) |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
| Voice | Web Speech API (SpeechSynthesis + SpeechRecognition) |
| Persistence | localStorage (moods, journal, CBT, burnout, chat) |

---

## 🌐 Maya's 19 Languages

**Indian:** Hindi · Tamil · Telugu · Bengali · Marathi · Gujarati · Kannada · Malayalam · Punjabi  
**International:** English · Spanish · French · German · Japanese · Korean · Chinese · Arabic · Portuguese · Russian

Maya responds in natural conversational style in each language — Hinglish for Indian users, casual slang for international ones.

---

## 🛠️ Setup & Run

```bash
# 1. Clone and install
cd aicoax
npm install

# 2. Add environment variable
echo "ANTHROPIC_API_KEY=your_key_here" > .env.local

# 3. Start development server
npm run dev
# → http://localhost:3000
```

---

## 🔐 Ethical Design

- ✅ **Not a Therapist** — clearly positioned as a support layer
- ✅ **Crisis Escalation** — Maya directs users to iCall (9152987821) in crisis
- ✅ **No Diagnosis** — zero medical claims
- ✅ **Local-first** — all personal data stays in the user's browser
- ✅ **Safe Language** — companion prompt trained to avoid harmful patterns

---

## 🧪 Maya Avatar — Technical Highlights

The Maya avatar (`components/MayaAvatar.tsx`) is a **pure SVG component** with:

- **Full body** — hair, face, sweater, skirt, tights, boots, chair (sitting pose)
- **10 expressions** — neutral, happy, sad, excited, coaxing, thinking, blush, crying, laughing, angry
- **Lip sync** — phoneme cycle `[0, 0.3, 0.72, 0.5, 1 ...]` drives mouth open/close at 85ms intervals
- **Blink** — random interval blink with 120ms close time
- **Pose transition** — `motion.path` animates skirt/legs between standing ↔ sitting
- **Emotion badge** — AnimatePresence badge below avatar
- **Tears** — animated falling ellipses for `crying`
- **Thinking bubbles** — pulsing circles for `thinking`

---

## 📱 PWA Ready

Includes `manifest.ts` for installability on mobile devices.

---

## ⚠️ Disclaimer

Reflect does not provide medical advice, diagnosis, or treatment.  
If you are in crisis, please contact a licensed professional or local helpline immediately.

**India crisis line: iCall — 9152987821**
