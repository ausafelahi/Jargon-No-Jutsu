import { createAdminClient } from "@/lib/supabase/admin";

export async function selectNextTheoryConcept(): Promise<string | null> {
  const supabase = createAdminClient();

  const [
    { data: lessons, error: lessonsError },
    { data: articles, error: articlesError },
  ] = await Promise.all([
    supabase.from("lessons").select("concept"),
    supabase.from("theory_articles").select("concept"),
  ]);

  if (lessonsError)
    throw new Error(`Failed to fetch lesson concepts: ${lessonsError.message}`);
  if (articlesError)
    throw new Error(
      `Failed to fetch existing theory concepts: ${articlesError.message}`,
    );

  const coveredConcepts = new Set((articles ?? []).map((a) => a.concept));
  const taughtConcepts = [...new Set((lessons ?? []).map((l) => l.concept))];

  const uncovered = taughtConcepts.filter((c) => !coveredConcepts.has(c));

  return uncovered[0] ?? null;
}
