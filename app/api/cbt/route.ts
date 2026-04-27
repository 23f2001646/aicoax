import Anthropic from "@anthropic-ai/sdk";
import { CBT_PROMPT } from "@/lib/prompts";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: Request) {
  const { situation, thought, emotion } = await req.json();

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1000,
    system: CBT_PROMPT,
    messages: [{ role: "user", content: `Situation: ${situation}\nAutomatic thought: ${thought}\nEmotion felt: ${emotion}` }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const clean = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  try {
    return Response.json(JSON.parse(clean));
  } catch {
    return Response.json({ error: "parse_failed" }, { status: 500 });
  }
}
