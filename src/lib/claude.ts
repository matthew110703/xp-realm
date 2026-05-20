import Anthropic from "@anthropic-ai/sdk";
import { CLAUDE_MODEL } from "@/constants/app.constants";

const globalForClaude = globalThis as unknown as { claude: Anthropic };

export const claude =
  globalForClaude.claude ??
  new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

if (process.env.NODE_ENV !== "production") globalForClaude.claude = claude;

export { CLAUDE_MODEL };

export async function callClaude(prompt: string, maxTokens = 1024): Promise<string> {
  const response = await claude.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: maxTokens,
    messages: [{ role: "user", content: prompt }],
  });

  const content = response.content[0];
  if (content.type !== "text") throw new Error("Unexpected Claude response type");
  return content.text;
}
