"use client";

import { useState } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";

interface BookmarkButtonProps {
  lessonId: string;
  initiallyBookmarked?: boolean;
}

export function BookmarkButton({
  lessonId,
  initiallyBookmarked = false,
}: BookmarkButtonProps) {
  const { user, loading } = useCurrentUser();
  const [bookmarked, setBookmarked] = useState(initiallyBookmarked);
  const [isSaving, setIsSaving] = useState(false);

  if (loading || !user) return null;

  const toggle = async () => {
    setIsSaving(true);
    const next = !bookmarked;
    try {
      if (next) {
        await fetch("/api/bookmarks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lessonId }),
        });
      } else {
        await fetch(`/api/bookmarks?lessonId=${lessonId}`, {
          method: "DELETE",
        });
      }
      setBookmarked(next);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isSaving}
      className={`rounded border px-4 py-2 font-mono text-xs tracking-wider transition-colors ${
        bookmarked
          ? "border-accent-pink bg-accent-pink/10 text-accent-pink"
          : "border-border text-foreground-muted hover:border-accent-teal hover:text-accent-teal"
      }`}
    >
      {bookmarked ? "★ BOOKMARKED" : "☆ BOOKMARK"}
    </button>
  );
}
