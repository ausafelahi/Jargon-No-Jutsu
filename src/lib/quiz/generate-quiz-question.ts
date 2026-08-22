import { createAdminClient } from "@/lib/supabase/admin";
import { selectNextQuizConcept } from "./select-concept";
import { generateQuizQuestion } from "./generate-quiz";
import type { QuizQuestion } from "@/types/database";

export interface GenerateQuizResult {
  question: QuizQuestion | null;
  skipped?: string;
}

export async function generateQuizForNextConcept(): Promise<GenerateQuizResult> {
  const concept = await selectNextQuizConcept();

  if (!concept) {
    return {
      question: null,
      skipped: "Every taught concept already has a quiz question.",
    };
  }

  console.log(`Generating quiz question for concept: ${concept}`);

  const generated = await generateQuizQuestion(concept);

  const supabase = createAdminClient();
  const { data: inserted, error } = await supabase
    .from("quiz_questions")
    .insert({
      concept,
      question: generated.question,
      options: generated.options,
      correct_index: generated.correctIndex,
      explanation: generated.explanation,
    })
    .select()
    .single();

  if (error || !inserted) {
    throw new Error(
      `Failed to save quiz question: ${error?.message ?? "unknown error"}`,
    );
  }

  return { question: inserted };
}
