import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const JOURNAL_PROMPT = `You are a compassionate journaling guide. The user has written a journal entry about their feelings and experiences.

Provide a warm, insightful reflection that:
1. Validates what they're feeling (never dismisses)
2. Gently names any patterns or themes you notice
3. Asks one meaningful question to help them go deeper
4. Offers one small, concrete next step if appropriate

Keep it short: 3-4 sentences max. Warm, human, non-clinical.`;

export async function POST(req: Request) {
  const { entry } = await req.json();

  const stream = await client.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 300,
    system: JOURNAL_PROMPT,
    messages: [{ role: "user", content: entry }],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
          controller.enqueue(encoder.encode(chunk.delta.text));
        }
      }
      controller.close();
    },
  });

  return new Response(readable, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
