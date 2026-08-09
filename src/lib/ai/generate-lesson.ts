import { generatedLessonSchema, type GeneratedLessonBody } from "./schema";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "nvidia/nemotron-3-ultra-550b-a55b:free";
const MAX_ATTEMPTS = 5;

interface GenerateLessonInput {
  character: string;
  anime: string;
  concept: string;
  characterDescription: string;
}

function buildPrompt({
  character,
  anime,
  concept,
  characterDescription,
}: GenerateLessonInput) {
  return `You write daily software engineering lessons for "Jargon no Jutsu," a platform that teaches technical concepts through anime characters.

Character: ${character}
Anime: ${anime}
Character context: ${characterDescription.slice(0, 500)}
Concept to teach: ${concept}

Write three things:
1. explanation — a clear, beginner-friendly technical definition of "${concept}" in software engineering. Do not mention the character here; this is the plain technical definition.
2. realWorldApplication — connect ${character}'s traits or behavior in ${anime} to "${concept}", explaining the parallel (this becomes the "Resonance" section). Avoid spoilers where possible.
3. careerAdvice — one practical, actionable piece of career advice a junior developer can apply, tied to "${concept}".

Rules:
- Beginner-friendly, practical, no fluff.
- No spoilers where avoidable.
- Return ONLY valid JSON, no markdown fences, no preamble, matching exactly:
{"explanation": "...", "realWorldApplication": "...", "careerAdvice": "..."}`;
}

export async function generateLessonBody(
  input: GenerateLessonInput,
): Promise<GeneratedLessonBody> {
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
          messages: [{ role: "user", content: buildPrompt(input) }],
          temperature: 0.8,
        }),
      });

      if (!res.ok) {
        throw new Error(
          `OpenRouter request failed: ${res.status} ${res.statusText}`,
        );
      }

      const json = await res.json();
      const raw: string = json.choices?.[0]?.message?.content ?? "";
      const cleaned = raw.replace(/^```json\s*|```$/g, "").trim();
      const parsed = JSON.parse(cleaned);

      return generatedLessonSchema.parse(parsed);
    } catch (err) {
      lastError = err;
    }
  }

  throw new Error(
    `Lesson generation failed after ${MAX_ATTEMPTS} attempts: ${
      lastError instanceof Error ? lastError.message : String(lastError)
    }`,
  );
}
