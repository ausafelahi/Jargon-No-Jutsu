"use client";

import { useState, useTransition } from "react";
import type { AuthActionResult } from "@/actions/auth";
import { signInWithOAuth } from "@/actions/auth";

interface AuthFormProps {
  mode: "sign-in" | "sign-up";
  action: (formData: FormData) => Promise<AuthActionResult>;
}

export function AuthForm({ mode, action }: AuthFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const result = await action(formData);
      if (result?.error) setError(result.error);
    });
  };

  return (
    <div className="mx-auto max-w-md rounded-md border border-border bg-background-elevated p-8">
      <h1 className="text-2xl font-bold text-heading">
        {mode === "sign-in" ? "Sign In" : "Join the Clan"}
      </h1>
      <p className="mt-1 text-sm text-foreground-muted">
        {mode === "sign-in"
          ? "Welcome back, shinobi."
          : "Create an account to bookmark lessons and get the daily digest."}
      </p>

      <div className="mt-6 flex flex-col gap-3">
        <button
          type="button"
          onClick={() => signInWithOAuth("google")}
          className="rounded border border-border px-4 py-2.5 text-sm font-medium hover:border-accent-teal"
        >
          Continue with Google
        </button>
        <button
          type="button"
          onClick={() => signInWithOAuth("github")}
          className="rounded border border-border px-4 py-2.5 text-sm font-medium hover:border-accent-teal"
        >
          Continue with GitHub
        </button>
      </div>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="font-mono text-xs text-foreground-muted">OR</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <form action={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label
            htmlFor="email"
            className="font-mono text-xs tracking-wider text-accent-teal"
          >
            EMAIL
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="mt-2 w-full rounded border border-border bg-background px-4 py-2.5 text-sm focus:border-accent-teal focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="font-mono text-xs tracking-wider text-accent-teal"
          >
            PASSWORD
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            className="mt-2 w-full rounded border border-border bg-background px-4 py-2.5 text-sm focus:border-accent-teal focus:outline-none"
          />
        </div>

        {error && <p className="text-sm text-accent-pink">{error}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="mt-2 rounded bg-accent-teal px-4 py-2.5 text-sm font-bold text-background hover:opacity-90 disabled:opacity-50"
        >
          {isPending
            ? "Please wait..."
            : mode === "sign-in"
              ? "Sign In"
              : "Create Account"}
        </button>
      </form>
    </div>
  );
}
