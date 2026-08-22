import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { NewsletterBlock } from "@/components/newsletter-block";
import { LessonDetail } from "@/features/lessons/lesson-detail";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();

  const { data: lessons, count } = await supabase
    .from("lessons")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(1);

  const latest = lessons?.[0];

  const { data: quizQuestion } = latest
    ? await supabase
        .from("quiz_questions")
        .select("*")
        .eq("concept", latest.concept)
        .maybeSingle()
    : { data: null };

  return (
    <>
      <SiteNav />
      <main>
        {latest ? (
          <LessonDetail
            lesson={latest}
            lessonNumber={count ?? 1}
            animeTitle={latest.anime_name}
            characterTier={latest.tier ?? undefined}
            quizQuestion={quizQuestion}
          />
        ) : (
          <div className="mx-auto max-w-2xl px-6 py-24 text-center">
            <h1 className="text-3xl font-bold text-heading">No lessons yet</h1>
            <p className="mt-3 text-foreground-muted">
              Run{" "}
              <code className="font-mono text-accent-teal">
                npm run generate:lesson
              </code>{" "}
              to create the first one.
            </p>
          </div>
        )}
        <NewsletterBlock />
      </main>
      <SiteFooter />
    </>
  );
}
