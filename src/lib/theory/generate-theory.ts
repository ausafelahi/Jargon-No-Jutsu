import { generatedTheorySchema, type GeneratedTheoryBody } from "./schema";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "nvidia/nemotron-3-ultra-550b-a55b:free";
const MAX_ATTEMPTS = 3;

function buildPrompt(concept: string): string {
  return `You write long-form technical reference articles for "Jargon no Jutsu," a
software engineering learning platform. This is the "Theory" section. Unlike the
site's daily anime-themed lessons, these articles have NO anime characters, NO
analogies, NO career-advice framing. Just a real, rigorous technical explanation,
the kind you'd find in a well-written engineering blog post or textbook chapter.

Concept: ${concept}

Write:
1. title: a clear, specific title for this article (not just the concept name repeated).
2. content: a genuinely long-form explanation (at least 500 words) covering what it
   is, why it matters, how it actually works (mechanisms, not just definitions),
   common misconceptions or edge cases, and how it connects to related concepts.
   Write in plain paragraphs. No markdown headers, no bullet-point lists. Flowing
   prose, like a well-edited article.

Rules:
- Technically accurate and precise. Don't oversimplify.
- No anime references, no character names, no "just like X does Y" analogies.
- Do not use em dashes (—) anywhere. Use commas, periods, or separate sentences instead.
- Return ONLY valid JSON, no markdown fences, no preamble, matching exactly:
{"title": "...", "content": "..."}`;
}

export async function generateTheoryBody(
  concept: string,
): Promise<GeneratedTheoryBody> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [{ role: "user", content: buildPrompt(concept) }],
          temperature: 0.6,
          max_tokens: 2500,
        }),
      });

      if (!res.ok) {
        throw new Error(
          `OpenRouter request failed: ${res.status} ${res.statusText}`,
        );
      }

      const json = await res.json();
      const raw: string = json.choices?.[0]?.message?.content ?? "";
      const finishReason = json.choices?.[0]?.finish_reason;
      const cleaned = raw.replace(/^```json\s*|```$/g, "").trim();

      let parsed: unknown;
      try {
        parsed = JSON.parse(cleaned);
      } catch (parseErr) {
        throw new Error(
          `Failed to parse model output as JSON (finish_reason: ${finishReason ?? "unknown"}). ` +
            `Raw output (last 300 chars): ...${cleaned.slice(-300)}`,
        );
      }

      return generatedTheorySchema.parse(parsed);
    } catch (err) {
      lastError = err;
    }
  }

  throw new Error(
    `Theory generation failed after ${MAX_ATTEMPTS} attempts: ${
      lastError instanceof Error ? lastError.message : String(lastError)
    }`,
  );
}
