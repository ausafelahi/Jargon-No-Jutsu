import Link from "next/link";
import { Logo } from "./logo";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/actions/auth";
import { recordDailyActivity } from "@/lib/streaks/record-activity";

const NAV_LINKS = [
  { href: "/lessons", label: "Lessons" },
  { href: "/archive", label: "Archive" },
  { href: "/theory", label: "Theory" },
  { href: "/learning-paths", label: "Paths" },
  { href: "/scrolls", label: "Scrolls" },
];

export async function SiteNav() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  const streak = claims
    ? await recordDailyActivity(claims.sub).catch((err) => {
        console.warn(
          "Streak recording failed:",
          err instanceof Error ? err.message : err,
        );
        return null;
      })
    : null;

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/">
          <Logo />
        </Link>

        <nav className="hidden gap-8 font-mono text-sm md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-foreground-muted transition-colors hover:text-accent-teal"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {claims ? (
            <>
              {streak && streak.currentStreak > 0 && (
                <span
                  className="flex items-center gap-1 font-mono text-sm text-accent-pink"
                  title={`Longest streak: ${streak.longestStreak} days`}
                >
                  🔥 {streak.currentStreak}
                </span>
              )}
              <span className="font-mono text-sm text-foreground-muted">
                {claims.email}
              </span>
              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded border border-border px-4 py-2 font-mono text-sm text-foreground-muted hover:border-accent-teal hover:text-accent-teal"
                >
                  Sign Out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="font-mono text-sm text-foreground-muted hover:text-foreground"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="rounded bg-accent-teal px-4 py-2 font-mono text-sm font-bold text-background hover:opacity-90"
              >
                JOIN CLAN
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
