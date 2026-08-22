import { createAdminClient } from "@/lib/supabase/admin";

export async function selectNextQuizConcept(): Promise<string | null> {
  const supabase = createAdminClient();

  const [
    { data: lessons, error: lessonsError },
    { data: questions, error: questionsError },
  ] = await Promise.all([
    supabase.from("lessons").select("concept"),
    supabase.from("quiz_questions").select("concept"),
  ]);

  if (lessonsError)
    throw new Error(`Failed to fetch lesson concepts: ${lessonsError.message}`);
  if (questionsError)
    throw new Error(
      `Failed to fetch existing quiz concepts: ${questionsError.message}`,
    );

  const coveredConcepts = new Set((questions ?? []).map((q) => q.concept));
  const taughtConcepts = [...new Set((lessons ?? []).map((l) => l.concept))];

  const uncovered = taughtConcepts.filter((c) => !coveredConcepts.has(c));

  return uncovered[0] ?? null;
}
