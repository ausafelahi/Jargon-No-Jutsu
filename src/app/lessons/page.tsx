import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { LessonCard } from "@/features/lessons/lesson-card";
import { ArchiveControls } from "@/features/lessons/archive-controls";
import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";

interface LessonsPageProps {
  searchParams: Promise<{ q?: string; sort?: string }>;
}

export default async function LessonsPage({ searchParams }: LessonsPageProps) {
  const { q, sort } = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("lessons").select("*");

  if (q) {
    const pattern = `%${q}%`;
    query = query.or(
      `character_name.ilike.${pattern},anime_name.ilike.${pattern},concept.ilike.${pattern}`,
    );
  }

  query = query.order("created_at", { ascending: sort === "oldest" }).limit(50);

  const { data: lessons, error } = await query;

  return (
    <>
      <SiteNav />
      <main className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="text-3xl font-bold text-heading">Lessons</h1>
        <p className="mt-2 text-foreground-muted">
          Every jutsu taught so far. Search, sort, and dig in.
        </p>

        <div className="mt-8">
          <Suspense fallback={null}>
            <ArchiveControls />
          </Suspense>
        </div>

        {error && (
          <p className="mt-8 text-accent-pink">
            Failed to load lessons: {error.message}
          </p>
        )}

        {!error && lessons && lessons.length === 0 && (
          <p className="mt-12 text-foreground-muted">
            {q ? `No lessons match "${q}".` : "No lessons yet."}
          </p>
        )}

        {lessons && lessons.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {lessons.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} />
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
