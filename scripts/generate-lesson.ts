import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { generateDailyLesson } from "@/lib/ai/generate-daily-lesson";

async function main() {
  if (process.env.LESSON_GENERATION_ENABLED !== "true") {
    console.log("LESSON_GENERATION_ENABLED is not 'true' — skipping.");
    return;
  }

  const { lesson } = await generateDailyLesson();
  console.log(
    `Generated lesson: ${lesson.character_name} (${lesson.anime_name}) — ${lesson.concept}`,
  );
}

main().catch((err) => {
  console.error("Lesson generation failed:", err);
  process.exit(1);
});
