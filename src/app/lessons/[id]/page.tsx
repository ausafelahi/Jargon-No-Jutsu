import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { LessonDetail } from "@/features/lessons/lesson-detail";
import { createClient } from "@/lib/supabase/server";

interface LessonPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: LessonPageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();

  const { data: lesson } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", id)
    .single();

  if (!lesson) {
    return { title: "Lesson not found | Jargon no Jutsu" };
  }

  const title = `${lesson.concept} via ${lesson.character_name} | Jargon no Jutsu`;
  const description = lesson.lesson.slice(0, 160);

  return {
    title,
    description,
    openGraph: { title, description, type: "article" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: lesson, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !lesson) {
    notFound();
  }

  const { count } = await supabase
    .from("lessons")
    .select("*", { count: "exact", head: true })
    .lte("created_at", lesson.created_at);

  const { data: quizQuestion } = await supabase
    .from("quiz_questions")
    .select("*")
    .eq("concept", lesson.concept)
    .maybeSingle();

  return (
    <>
      <SiteNav />
      <main>
        <LessonDetail
          lesson={lesson}
          lessonNumber={count ?? 1}
          animeTitle={lesson.anime_name}
          characterTier={lesson.tier ?? undefined}
          quizQuestion={quizQuestion}
        />
      </main>
      <SiteFooter />
    </>
  );
}
