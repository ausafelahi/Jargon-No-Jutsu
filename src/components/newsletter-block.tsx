"use client";

import { useState, useTransition } from "react";
import { subscribe } from "@/actions/subscribe";

export function NewsletterBlock() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    setStatus("idle");
    setError(null);
    startTransition(async () => {
      const result = await subscribe(formData);
      if (result.success) {
        setStatus("success");
      } else {
        setStatus("error");
        setError(result.error ?? "Something went wrong.");
      }
    });
  };

  return (
    <div className="relative mx-auto mt-16 max-w-3xl rounded-md border border-border bg-background-elevated p-8">
      <h3 className="text-2xl font-bold text-heading">Join the Clan</h3>
      <p className="mt-2 text-foreground-muted">
        Receive one technical jutsu breakdown weekly. No spam, only knowledge.
      </p>

      {status === "success" ? (
        <p className="mt-6 font-mono text-sm text-accent-teal">
          Transmission received. You&apos;re in. Check your inbox in spam or
          junk.
        </p>
      ) : (
        <form action={handleSubmit} className="mt-6">
          <label
            htmlFor="email"
            className="font-mono text-xs tracking-wider text-accent-teal"
          >
            TRANSMISSION LINE
          </label>
          <div className="mt-2 flex gap-3">
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="ENTER_SCROLL_ADDRESS..."
              className="flex-1 rounded border border-border bg-background px-4 py-3 font-mono text-sm text-foreground placeholder:text-foreground-muted focus:border-accent-teal focus:outline-none"
            />
            <button
              type="submit"
              disabled={isPending}
              className="rounded bg-accent-pink px-6 py-3 font-mono text-sm font-bold text-background hover:opacity-90 disabled:opacity-50"
            >
              {isPending ? "..." : "SUBSCRIBE"}
            </button>
          </div>
          {error && <p className="mt-2 text-sm text-accent-pink">{error}</p>}
        </form>
      )}
    </div>
  );
}
