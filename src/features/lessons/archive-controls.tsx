"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState } from "react";

export function ArchiveControls() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const sort = searchParams.get("sort") ?? "newest";

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateParam("q", query.trim() || null);
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <form onSubmit={handleSearchSubmit} className="flex flex-1 gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="SEARCH_CHARACTER_ANIME_OR_CONCEPT..."
          className="flex-1 rounded border border-border bg-background-elevated px-4 py-2.5 font-mono text-sm text-foreground placeholder:text-foreground-muted focus:border-accent-teal focus:outline-none"
        />
        <button
          type="submit"
          className="rounded border border-accent-teal px-4 py-2.5 font-mono text-xs text-accent-teal hover:bg-accent-teal/10"
        >
          SEARCH
        </button>
      </form>

      <div className="flex gap-2 font-mono text-xs">
        <button
          type="button"
          onClick={() => updateParam("sort", "newest")}
          className={`rounded border px-3 py-2 ${
            sort === "newest"
              ? "border-accent-teal text-accent-teal"
              : "border-border text-foreground-muted"
          }`}
        >
          NEWEST
        </button>
        <button
          type="button"
          onClick={() => updateParam("sort", "oldest")}
          className={`rounded border px-3 py-2 ${
            sort === "oldest"
              ? "border-accent-teal text-accent-teal"
              : "border-border text-foreground-muted"
          }`}
        >
          OLDEST
        </button>
      </div>
    </div>
  );
}
