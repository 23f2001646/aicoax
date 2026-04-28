import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const { moods, sessions, gratitudeItems, name } = await req.json();

  const userName = name || "friend";

  // Compute week-over-week stats server-side for the prompt
  const now = new Date();
  function weekSlice(weeksAgo: number) {
    const end = new Date(now); end.setDate(end.getDate() - weeksAgo * 7);
    const start = new Date(end); start.setDate(start.getDate() - 7);
    const s = start.toISOString().slice(0,10);
    const e = end.toISOString().slice(0,10);
    return (moods as {date:string;mood:number;note?:string}[]).filter(m => m.date >= s && m.date < e);
  }
  const thisWeek = weekSlice(0);
  const lastWeek = weekSlice(1);
  const thisAvg = thisWeek.length ? (thisWeek.reduce((s:number,m:{mood:number})=>s+m.mood,0)/thisWeek.length).toFixed(2) : null;
  const lastAvg = lastWeek.length ? (lastWeek.reduce((s:number,m:{mood:number})=>s+m.mood,0)/lastWeek.length).toFixed(2) : null;

  // Day-of-week stats
  const byDay: Record<number, number[]> = {};
  (moods as {date:string;mood:number}[]).forEach(m => {
    const d = new Date(m.date + "T12:00:00").getDay();
    if (!byDay[d]) byDay[d] = [];
    byDay[d].push(m.mood);
  });
  const dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const dayAvgs = Object.entries(byDay).map(([d,v]) => ({ day: dayNames[parseInt(d)], avg: (v.reduce((a,b)=>a+b,0)/v.length) }));
  dayAvgs.sort((a,b) => b.avg - a.avg);

  const prompt = `You are a compassionate mental health analyst. Generate a warm, insightful wellbeing report for ${userName}.

Mood log (last 14 days, scale 0-5):
${JSON.stringify(moods, null, 2)}

This week average mood: ${thisAvg ?? "not enough data"}
Last week average mood: ${lastAvg ?? "not enough data"}

Day-of-week averages: ${dayAvgs.map(d => `${d.day}: ${d.avg.toFixed(1)}`).join(", ") || "not enough data"}

Session count: ${JSON.stringify(sessions)}

Gratitude journal items this week (look for recurring themes and potential stressors):
${gratitudeItems?.length ? gratitudeItems.join(", ") : "none"}

Output ONLY valid JSON with this exact shape — no markdown, no extra text:
{
  "summary": "2-3 sentence warm, personal overview of ${userName}'s mental wellbeing",
  "trend": "improving | stable | declining | mixed",
  "trendNote": "1 sentence explaining the trend with reference to the data",
  "weekOverWeek": "1 sentence comparing this week to last week, with specific numbers if available",
  "dayPatterns": "1 sentence about best/worst days of the week based on the data, or null if not enough data",
  "topEmotions": ["emotion1", "emotion2", "emotion3"],
  "strengths": ["specific strength observed in the data", "another strength"],
  "challenges": ["specific challenge", "another challenge"],
  "suggestions": ["specific actionable suggestion", "another suggestion", "a third suggestion"],
  "triggers": ["potential trigger from notes/gratitude", "another trigger"],
  "affirmation": "one warm, personal, specific closing affirmation for ${userName}"
}`;

  try {
    const msg = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 800,
      messages: [{ role: "user", content: prompt }],
    });

    const text = (msg.content[0] as { type: string; text: string }).text;
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return NextResponse.json({ error: "parse error" }, { status: 500 });
    return NextResponse.json(JSON.parse(match[0]));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "AI error" }, { status: 500 });
  }
}
