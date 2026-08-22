"use client";

import { useState } from "react";

interface ShareButtonProps {
  title: string;
}

export function ShareButton({ title }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {}
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="rounded border border-border px-4 py-2 font-mono text-xs tracking-wider text-foreground-muted transition-colors hover:border-accent-teal hover:text-accent-teal"
    >
      {copied ? "LINK COPIED" : "SHARE"}
    </button>
  );
}
