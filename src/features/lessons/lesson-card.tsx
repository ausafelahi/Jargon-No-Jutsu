import Link from "next/link";
import type { Lesson } from "@/types/database";

export function LessonCard({ lesson }: { lesson: Lesson }) {
  return (
    <Link
      href={`/lessons/${lesson.id}`}
      className="group flex flex-col overflow-hidden rounded-md border border-border bg-background-elevated transition-colors hover:border-accent-teal"
    >
      <div className="flex h-40 items-center justify-center overflow-hidden bg-background">
        {lesson.image_url ? (
          <img
            src={lesson.image_url}
            alt={lesson.character_name}
            className="h-full max-w-[160px] object-contain"
          />
        ) : (
          <span className="font-mono text-xs text-foreground-muted">
            No portrait
          </span>
        )}
      </div>

      <div className="p-4">
        {lesson.tier && (
          <span className="badge-tier text-[10px]">{lesson.tier}</span>
        )}
        <h3 className="mt-2 text-lg font-bold text-heading group-hover:text-accent-teal">
          {lesson.concept}
        </h3>
        <p className="mt-1 text-sm text-accent-pink">{lesson.character_name}</p>
        <p className="text-xs text-foreground-muted">{lesson.anime_name}</p>
      </div>
    </Link>
  );
}
