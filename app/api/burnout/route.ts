import Anthropic from "@anthropic-ai/sdk";
import { BURNOUT_PROMPT } from "@/lib/prompts";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: Request) {
  const { answers } = await req.json();

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1200,
    system: BURNOUT_PROMPT,
    messages: [{ role: "user", content: `Burnout assessment answers:\n${JSON.stringify(answers, null, 2)}` }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const clean = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  try {
    return Response.json(JSON.parse(clean));
  } catch {
    return Response.json({ error: "parse_failed" }, { status: 500 });
  }
}
