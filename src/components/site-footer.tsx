import Link from "next/link";
import { Logo } from "./logo";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm md:flex-row">
        <div className="flex items-center gap-4">
          <Logo showWordmark={false} />
          <span className="font-mono font-bold text-accent-pink">
            Jargon no Jutsu
          </span>
          <span className="text-foreground-muted">
            © {new Date().getFullYear()} Jargon no Jutsu. Engineered for
            Shinobi.
          </span>
        </div>

        <div className="flex gap-6 font-mono text-xs uppercase tracking-wider text-foreground-muted">
          <Link href="/terms" className="hover:text-accent-teal">
            Terms of Service
          </Link>
          <Link href="/privacy" className="hover:text-accent-teal">
            Privacy Protocol
          </Link>
          <Link
            href="https://github.com/ausafelahi"
            className="hover:text-accent-teal"
          >
            GitHub
          </Link>
        </div>
      </div>
    </footer>
  );
}
