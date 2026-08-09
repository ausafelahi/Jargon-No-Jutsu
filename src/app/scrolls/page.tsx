import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { LessonCard } from "@/features/lessons/lesson-card";
import { createClient } from "@/lib/supabase/server";

export default async function ScrollsPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (!claims) {
    return (
      <>
        <SiteNav />
        <main className="mx-auto max-w-2xl px-6 py-24 text-center">
          <h1 className="text-3xl font-bold text-heading">Scrolls</h1>
          <p className="mt-3 text-foreground-muted">
            Sign in to see your bookmarked lessons.
          </p>
          <Link
            href="/sign-in"
            className="mt-6 inline-block rounded bg-accent-teal px-5 py-2.5 font-mono text-sm font-bold text-background hover:opacity-90"
          >
            Sign In
          </Link>
        </main>
        <SiteFooter />
      </>
    );
  }

  const { data: bookmarks, error } = await supabase
    .from("bookmarks")
    .select("lesson_id, lessons(*)")
    .eq("user_id", claims.sub)
    .order("created_at", { ascending: false });

  const lessons = (bookmarks ?? [])
    .map((b) => b.lessons)
    .filter((l): l is NonNullable<typeof l> => Boolean(l));

  return (
    <>
      <SiteNav />
      <main className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="text-3xl font-bold text-heading">Scrolls</h1>
        <p className="mt-2 text-foreground-muted">Your bookmarked lessons.</p>

        {error && (
          <p className="mt-8 text-accent-pink">
            Failed to load: {error.message}
          </p>
        )}

        {!error && lessons.length === 0 && (
          <p className="mt-12 text-foreground-muted">
            No bookmarks yet — bookmark a lesson from its page to save it here.
          </p>
        )}

        {lessons.length > 0 && (
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
