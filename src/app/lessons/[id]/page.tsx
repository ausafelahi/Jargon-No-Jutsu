import { notFound } from "next/navigation";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { LessonDetail } from "@/features/lessons/lesson-detail";
import { createClient } from "@/lib/supabase/server";

interface LessonPageProps {
  params: Promise<{ id: string }>;
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

  return (
    <>
      <SiteNav />
      <main>
        <LessonDetail
          lesson={lesson}
          lessonNumber={count ?? 1}
          animeTitle={lesson.anime_name}
          characterTier={lesson.tier ?? undefined}
        />
      </main>
      <SiteFooter />
    </>
  );
}
