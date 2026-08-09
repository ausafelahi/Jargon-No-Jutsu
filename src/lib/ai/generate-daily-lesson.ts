import { createAdminClient } from "@/lib/supabase/admin";
import { fetchAniListCharacter } from "@/lib/anilist/client";
import { generateLessonBody } from "@/lib/ai/generate-lesson";
import { selectNextPairing } from "@/lib/ai/select-pairing";
import type { Lesson } from "@/types/database";

export interface GenerateDailyLessonResult {
  lesson: Lesson;
}

export async function generateDailyLesson(): Promise<GenerateDailyLessonResult> {
  const supabase = createAdminClient();

  const { data: previousLessonRows, error: fetchError } = await supabase
    .from("lessons")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1);

  if (fetchError) {
    throw new Error(`Failed to fetch previous lesson: ${fetchError.message}`);
  }

  const previousLesson = previousLessonRows?.[0] ?? null;
  const pairing = selectNextPairing(previousLesson);

  const character = await fetchAniListCharacter(pairing.character);

  const body = await generateLessonBody({
    character: character.name,
    anime: pairing.anime,
    concept: pairing.concept,
    characterDescription: character.description,
  });

  const lessonText = `${body.explanation}\n\n${body.realWorldApplication}`;

  const { data: inserted, error: insertError } = await supabase
    .from("lessons")
    .insert({
      character_name: character.name,
      anime_name: pairing.anime,
      image_url: character.imageUrl,
      concept: pairing.concept,
      lesson: lessonText,
      career_advice: body.careerAdvice,
      tier: pairing.tier,
    })
    .select()
    .single();

  if (insertError || !inserted) {
    throw new Error(
      `Failed to save lesson: ${insertError?.message ?? "unknown error"}`,
    );
  }

  return { lesson: inserted };
}
