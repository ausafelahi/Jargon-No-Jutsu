import { generatedTheorySchema, type GeneratedTheoryBody } from "./schema";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "nvidia/nemotron-3-ultra-550b-a55b:free";
const MAX_ATTEMPTS = 4;
const TITLE_MARKER = "TITLE:";
const CONTENT_MARKER = "===CONTENT===";

function buildPrompt(concept: string): string {
  return `You write long-form technical reference articles for "Jargon no Jutsu," a
software engineering learning platform. This is the "Theory" section. Unlike the
site's daily anime-themed lessons, these articles have NO anime characters, NO
analogies, NO career-advice framing. Just a real, rigorous technical explanation,
the kind you'd find in a well-written engineering blog post or textbook chapter.

Concept: ${concept}

Write a title and a long-form explanation (at least 400 words) covering what it
is, why it matters, how it actually works (mechanisms, not just definitions),
common misconceptions or edge cases, and how it connects to related concepts.
Write in plain paragraphs. No markdown headers, no bullet-point lists. Flowing
prose, like a well-edited article.

Rules:
- Technically accurate and precise. Don't oversimplify.
- No anime references, no character names, no "just like X does Y" analogies.
- Do not use em dashes anywhere. Use commas, periods, or separate sentences instead.
- Do not use markdown formatting (no asterisks, no headers, no backticks) anywhere.

Output format is REQUIRED to be exactly this plain text structure, nothing else
before or after it:

${TITLE_MARKER} <the article title on this one line>
${CONTENT_MARKER}
<the full article content here, plain paragraphs, no other markers or labels>`;
}

interface ParsedTheoryOutput {
  title: string;
  content: string;
}

export function parseTheoryOutput(raw: string): ParsedTheoryOutput {
  const titleIndex = raw.indexOf(TITLE_MARKER);
  const contentMarkerIndex = raw.indexOf(CONTENT_MARKER);

  if (
    titleIndex === -1 ||
    contentMarkerIndex === -1 ||
    contentMarkerIndex < titleIndex
  ) {
    throw new Error(
      `Output missing expected markers ("${TITLE_MARKER}" / "${CONTENT_MARKER}"). ` +
        `Raw output (first 300 chars): ${raw.slice(0, 300)}`,
    );
  }

  const title = raw
    .slice(titleIndex + TITLE_MARKER.length, contentMarkerIndex)
    .trim();
  const content = raw.slice(contentMarkerIndex + CONTENT_MARKER.length).trim();

  if (!title) {
    throw new Error("Parsed an empty title from the output.");
  }
  if (!content) {
    throw new Error("Parsed empty content from the output.");
  }

  return { title, content };
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
          max_tokens: 3000,
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

      if (!raw.trim()) {
        throw new Error(
          `Empty response from model (finish_reason: ${finishReason ?? "unknown"}).`,
        );
      }

      const parsed = parseTheoryOutput(raw);
      return generatedTheorySchema.parse(parsed);
    } catch (err) {
      lastError = err;
      console.warn(
        `Theory generation attempt ${attempt}/${MAX_ATTEMPTS} failed:`,
        err instanceof Error ? err.message : err,
      );
    }
  }

  throw new Error(
    `Theory generation failed after ${MAX_ATTEMPTS} attempts: ${
      lastError instanceof Error ? lastError.message : String(lastError)
    }`,
  );
}
