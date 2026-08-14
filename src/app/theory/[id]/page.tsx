import { notFound } from "next/navigation";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { createClient } from "@/lib/supabase/server";

interface TheoryArticlePageProps {
  params: Promise<{ id: string }>;
}

export default async function TheoryArticlePage({
  params,
}: TheoryArticlePageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: article, error } = await supabase
    .from("theory_articles")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !article) {
    notFound();
  }

  return (
    <>
      <SiteNav />
      <main className="mx-auto max-w-2xl px-6 py-12">
        <p className="font-mono text-xs tracking-wider text-accent-teal">
          {article.concept.toUpperCase()}
        </p>
        <h1 className="mt-3 text-4xl font-extrabold text-heading">
          {article.title}
        </h1>

        <div className="mt-8 whitespace-pre-line text-[17px] leading-relaxed text-foreground">
          {article.content}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
