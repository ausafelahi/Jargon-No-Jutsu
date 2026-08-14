import { createAdminClient } from "@/lib/supabase/admin";
import { selectNextTheoryConcept } from "./select-concept";
import { generateTheoryBody } from "./generate-theory";
import type { TheoryArticle } from "@/types/database";

export interface GenerateTheoryResult {
  article: TheoryArticle | null;
  skipped?: string;
}

export async function generateTheoryArticle(): Promise<GenerateTheoryResult> {
  const concept = await selectNextTheoryConcept();

  if (!concept) {
    return {
      article: null,
      skipped: "Every taught concept already has a theory article.",
    };
  }

  console.log(`Generating theory article for concept: ${concept}`);

  const body = await generateTheoryBody(concept);

  const supabase = createAdminClient();
  const { data: inserted, error } = await supabase
    .from("theory_articles")
    .insert({ concept, title: body.title, content: body.content })
    .select()
    .single();

  if (error || !inserted) {
    throw new Error(
      `Failed to save theory article: ${error?.message ?? "unknown error"}`,
    );
  }

  return { article: inserted };
}
