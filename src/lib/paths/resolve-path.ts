import { createClient } from "@/lib/supabase/server";
import type { Lesson } from "@/types/database";
import type { LearningPath } from "./curated-paths";

export interface ResolvedPathStep {
  concept: string;
  lesson: Lesson | null;
}

export async function resolvePathLessons(
  path: LearningPath,
): Promise<ResolvedPathStep[]> {
  const supabase = await createClient();

  const { data: lessons, error } = await supabase
    .from("lessons")
    .select("*")
    .in("concept", path.concepts)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to resolve path lessons: ${error.message}`);
  }

  const latestByConcept = new Map<string, Lesson>();
  for (const lesson of lessons ?? []) {
    if (!latestByConcept.has(lesson.concept)) {
      latestByConcept.set(lesson.concept, lesson);
    }
  }

  return path.concepts.map((concept) => ({
    concept,
    lesson: latestByConcept.get(concept) ?? null,
  }));
}
