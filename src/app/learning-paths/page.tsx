import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { LEARNING_PATHS } from "@/lib/paths/curated-paths";

export default function LearningPathsPage() {
  return (
    <>
      <SiteNav />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <span className="badge-terminal">LEARNING PATHS</span>
        <h1 className="mt-4 text-3xl font-bold text-heading">Paths</h1>
        <p className="mt-2 text-foreground-muted">
          Curated sequences through related lessons. Follow one start to finish
          instead of jumping around.
        </p>

        <div className="mt-8 flex flex-col gap-4">
          {LEARNING_PATHS.map((path) => (
            <Link
              key={path.slug}
              href={`/learning-paths/${path.slug}`}
              className="group rounded-md border border-border bg-background-elevated p-6 transition-colors hover:border-accent-teal"
            >
              <h2 className="text-xl font-bold text-heading group-hover:text-accent-teal">
                {path.title}
              </h2>
              <p className="mt-2 text-sm text-foreground-muted">
                {path.description}
              </p>
              <p className="mt-3 font-mono text-xs text-accent-pink">
                {path.concepts.length} lessons
              </p>
            </Link>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
