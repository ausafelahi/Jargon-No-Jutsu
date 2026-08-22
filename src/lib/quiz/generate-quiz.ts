import { generatedQuizSchema, type GeneratedQuiz } from "./schema";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "nvidia/nemotron-3-ultra-550b-a55b:free";
const MAX_ATTEMPTS = 3;

const MARKERS = {
  question: "QUESTION:",
  optionA: "OPTION_A:",
  optionB: "OPTION_B:",
  optionC: "OPTION_C:",
  optionD: "OPTION_D:",
  correct: "CORRECT:",
  explanation: "EXPLANATION:",
} as const;

function buildPrompt(concept: string): string {
  return `You write multiple-choice quiz questions for "Jargon no Jutsu," a software
engineering learning platform, testing understanding of technical concepts.

Concept: ${concept}

Write one genuinely testing multiple-choice question about "${concept}". Four
options, exactly one correct. Wrong options should be plausible mistakes someone
learning the concept might actually make, not obviously silly.

Rules:
- Question should test real understanding, not just recall of a definition.
- Exactly 4 options, roughly similar length, no "all of the above" / "none of the above".
- Do not use em dashes anywhere. Use commas, periods, or separate sentences instead.
- Do not use markdown formatting anywhere.

Output format is REQUIRED to be exactly this plain text structure, nothing else
before or after it:

${MARKERS.question} <the question, one line>
${MARKERS.optionA} <option text>
${MARKERS.optionB} <option text>
${MARKERS.optionC} <option text>
${MARKERS.optionD} <option text>
${MARKERS.correct} <a single letter: A, B, C, or D>
${MARKERS.explanation} <why the correct answer is correct, and briefly why the others aren't, 2-3 sentences>`;
}

function parseQuizOutput(raw: string): GeneratedQuiz {
  function extract(marker: string, nextMarker: string | null): string {
    const start = raw.indexOf(marker);
    if (start === -1) {
      throw new Error(
        `Output missing expected marker "${marker}". Raw output (first 300 chars): ${raw.slice(0, 300)}`,
      );
    }
    const contentStart = start + marker.length;
    const end = nextMarker ? raw.indexOf(nextMarker, contentStart) : raw.length;
    if (nextMarker && end === -1) {
      throw new Error(
        `Output missing expected marker "${nextMarker}" after "${marker}".`,
      );
    }
    return raw.slice(contentStart, end === -1 ? raw.length : end).trim();
  }

  const question = extract(MARKERS.question, MARKERS.optionA);
  const optionA = extract(MARKERS.optionA, MARKERS.optionB);
  const optionB = extract(MARKERS.optionB, MARKERS.optionC);
  const optionC = extract(MARKERS.optionC, MARKERS.optionD);
  const optionD = extract(MARKERS.optionD, MARKERS.correct);
  const correctLetter = extract(MARKERS.correct, MARKERS.explanation)
    .trim()
    .toUpperCase()
    .charAt(0);
  const explanation = extract(MARKERS.explanation, null);

  const letterToIndex: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };
  const correctIndex = letterToIndex[correctLetter];

  if (correctIndex === undefined) {
    throw new Error(
      `Could not parse a valid answer letter from "${correctLetter}". Expected A, B, C, or D.`,
    );
  }

  return {
    question,
    options: [optionA, optionB, optionC, optionD],
    correctIndex,
    explanation,
  };
}

export async function generateQuizQuestion(
  concept: string,
): Promise<GeneratedQuiz> {
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
          temperature: 0.7,
          max_tokens: 800,
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

      const parsed = parseQuizOutput(raw);
      return generatedQuizSchema.parse(parsed);
    } catch (err) {
      lastError = err;
      console.warn(
        `Quiz generation attempt ${attempt}/${MAX_ATTEMPTS} failed:`,
        err instanceof Error ? err.message : err,
      );
    }
  }

  throw new Error(
    `Quiz generation failed after ${MAX_ATTEMPTS} attempts: ${
      lastError instanceof Error ? lastError.message : String(lastError)
    }`,
  );
}

export { parseQuizOutput };
