import type { Lesson } from "@/types/database";
import { BookmarkButton } from "@/features/bookmarks/bookmark-button";

interface LessonPageProps {
  lesson: Lesson;
  lessonNumber: number;
  animeTitle: string;
  characterTier?: string;
  quizQuestion?: string;
  codeSnippet?: string;
  codeLanguage?: string;
}

export function LessonDetail({
  lesson,
  lessonNumber,
  animeTitle,
  characterTier = "SHINOBI TIER",
  quizQuestion,
  codeSnippet,
  codeLanguage = "JS",
}: LessonPageProps) {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid gap-12 md:grid-cols-2">
        <div>
          <div className="flex items-center justify-between">
            <span className="badge-terminal">
              DAILY LESSON #{String(lessonNumber).padStart(3, "0")}
            </span>
            <BookmarkButton lessonId={lesson.id} />
          </div>
          <h1 className="mt-4 border-l-2 border-heading pl-4 text-5xl font-extrabold text-heading">
            {lesson.concept}
          </h1>

          <div className="card-accent-teal mt-8">
            <h2 className="flex items-center gap-2 text-lg font-bold text-accent-teal">
              Technical Definition
            </h2>
            <p className="mt-3 text-foreground-muted">{lesson.lesson}</p>
          </div>

          {codeSnippet && (
            <div className="code-terminal mt-6">
              <div className="mb-3 text-right text-xs text-foreground-muted">
                {codeLanguage}
              </div>
              <pre className="overflow-x-auto text-foreground">
                <code>{codeSnippet}</code>
              </pre>
            </div>
          )}

          <div className="mt-8">
            <p className="font-mono text-xs tracking-wider text-foreground-muted">
              ANALOGOUS SYSTEM
            </p>
            <p className="mt-2 italic text-foreground-muted">
              {lesson.career_advice}
            </p>
          </div>
        </div>

        <div>
          <div className="flex items-start justify-between">
            <div className="ml-auto text-right">
              <span className="badge-tier">{characterTier}</span>
              <h2 className="mt-3 text-3xl font-extrabold text-accent-pink">
                {lesson.character_name}
              </h2>
              <p className="mt-1 font-mono text-sm text-foreground-muted">
                {animeTitle}
              </p>
            </div>
          </div>

          <div className="mt-6 flex h-80 w-full items-center justify-center overflow-hidden rounded-md border border-border bg-background">
            {lesson.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={lesson.image_url}
                alt={`${lesson.character_name} — ${animeTitle}`}
                className="h-full max-w-[280px] object-contain"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-background-elevated font-mono text-xs text-foreground-muted">
                Character art loads from AniList
              </div>
            )}
          </div>

          <div className="card-accent-pink mt-6">
            <h3 className="flex items-center gap-2 text-lg font-bold text-accent-pink">
              The Resonance ⚡
            </h3>
            <p className="mt-3 text-foreground-muted">
              Just as {lesson.character_name} embodies{" "}
              {lesson.concept.toLowerCase()}, {lesson.lesson}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
