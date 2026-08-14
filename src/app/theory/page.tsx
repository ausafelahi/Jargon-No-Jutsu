import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { createClient } from "@/lib/supabase/server";

export default async function TheoryPage() {
  const supabase = await createClient();
  const { data: articles, error } = await supabase
    .from("theory_articles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <>
      <SiteNav />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <span className="badge-terminal">THEORY</span>
        <h1 className="mt-4 text-3xl font-bold text-heading">Theory</h1>
        <p className="mt-2 text-foreground-muted">
          The daily lessons teach concepts through anime characters. These go
          deeper. Real technical breakdowns, no analogies.
        </p>

        {error && (
          <p className="mt-8 text-accent-pink">
            Failed to load: {error.message}
          </p>
        )}

        {!error && (!articles || articles.length === 0) && (
          <p className="mt-12 text-foreground-muted">
            No articles yet. Run{" "}
            <code className="font-mono text-accent-teal">
              npm run generate:theory
            </code>{" "}
            to create the first one.
          </p>
        )}

        {articles && articles.length > 0 && (
          <div className="mt-8 flex flex-col divide-y divide-border border-y border-border">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/theory/${article.id}`}
                className="group py-5 transition-colors hover:bg-background-elevated"
              >
                <p className="font-mono text-xs tracking-wider text-accent-teal">
                  {article.concept.toUpperCase()}
                </p>
                <h2 className="mt-1 text-xl font-bold text-heading group-hover:text-accent-teal">
                  {article.title}
                </h2>
              </Link>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
