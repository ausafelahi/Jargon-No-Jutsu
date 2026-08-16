import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { getPathBySlug } from "@/lib/paths/curated-paths";
import { resolvePathLessons } from "@/lib/paths/resolve-path";

interface PathPageProps {
  params: Promise<{ slug: string }>;
}

export default async function LearningPathPage({ params }: PathPageProps) {
  const { slug } = await params;
  const path = getPathBySlug(slug);

  if (!path) {
    notFound();
  }

  const steps = await resolvePathLessons(path);

  return (
    <>
      <SiteNav />
      <main className="mx-auto max-w-2xl px-6 py-12">
        <Link
          href="/learning-paths"
          className="font-mono text-xs text-foreground-muted hover:text-accent-teal"
        >
          &larr; All paths
        </Link>

        <h1 className="mt-4 text-3xl font-bold text-heading">{path.title}</h1>
        <p className="mt-2 text-foreground-muted">{path.description}</p>

        <ol className="mt-8 flex flex-col gap-3">
          {steps.map((step, index) => (
            <li key={step.concept}>
              {step.lesson ? (
                <Link
                  href={`/lessons/${step.lesson.id}`}
                  className="group flex items-center gap-4 rounded-md border border-border bg-background-elevated p-4 transition-colors hover:border-accent-teal"
                >
                  <span className="font-mono text-sm text-accent-teal">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="font-bold text-heading group-hover:text-accent-teal">
                      {step.concept}
                    </p>
                    <p className="text-sm text-accent-pink">
                      {step.lesson.character_name}
                    </p>
                  </div>
                </Link>
              ) : (
                <div className="flex items-center gap-4 rounded-md border border-dashed border-border p-4 opacity-60">
                  <span className="font-mono text-sm text-foreground-muted">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="font-bold text-foreground-muted">
                      {step.concept}
                    </p>
                    <p className="font-mono text-xs text-foreground-muted">
                      Not yet taught
                    </p>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ol>
      </main>
      <SiteFooter />
    </>
  );
}
