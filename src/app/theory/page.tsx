import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";

export default function TheoryPage() {
  return (
    <>
      <SiteNav />
      <main className="mx-auto max-w-2xl px-6 py-24 text-center">
        <span className="badge-terminal">COMING SOON</span>
        <h1 className="mt-4 text-3xl font-bold text-heading">Theory</h1>
        <p className="mt-3 text-foreground-muted">
          Deeper technical breakdowns beyond the daily lesson. Not built yet.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
