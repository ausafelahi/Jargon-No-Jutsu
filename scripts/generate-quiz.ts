import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { generateQuizForNextConcept } from "@/lib/quiz/generate-quiz-question";

async function main() {
  const result = await generateQuizForNextConcept();

  if (!result.question) {
    console.log(result.skipped ?? "No question generated.");
    return;
  }

  console.log(
    `Generated quiz question for concept: ${result.question.concept}`,
  );
}

main().catch((err) => {
  console.error("Quiz generation failed:", err);
  process.exit(1);
});
