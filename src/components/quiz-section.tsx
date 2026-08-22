"use client";

import { useState } from "react";
import type { QuizQuestion } from "@/types/database";

interface QuizSectionProps {
  question: QuizQuestion | null;
}

export function QuizSection({ question }: QuizSectionProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!question) {
    return (
      <div className="mt-6 rounded-md border border-border bg-background-elevated p-6">
        <p className="font-mono text-xs tracking-wider text-accent-pink">
          TRIAL BY FIRE
        </p>
        <p className="mt-3 text-sm text-foreground-muted">
          No quiz question for this concept yet.
        </p>
      </div>
    );
  }

  const isCorrect = selected === question.correct_index;

  async function handleSubmit() {
    if (selected === null || submitted) return;
    setSubmitted(true);
    setIsSaving(true);
    try {
      await fetch("/api/quiz/attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: question!.id,
          selectedIndex: selected,
        }),
      });
    } catch {
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mt-6 rounded-md border border-border bg-background-elevated p-6">
      <p className="font-mono text-xs tracking-wider text-accent-pink">
        TRIAL BY FIRE
      </p>
      <p className="mt-3 font-semibold">{question.question}</p>

      <div className="mt-4 flex flex-col gap-2">
        {question.options.map((option, index) => {
          const isSelected = selected === index;
          const showCorrect = submitted && index === question.correct_index;
          const showWrong =
            submitted && isSelected && index !== question.correct_index;

          return (
            <button
              key={index}
              type="button"
              disabled={submitted}
              onClick={() => setSelected(index)}
              className={`rounded border px-4 py-2.5 text-left text-sm transition-colors ${
                showCorrect
                  ? "border-accent-teal bg-accent-teal/10 text-accent-teal"
                  : showWrong
                    ? "border-accent-pink bg-accent-pink/10 text-accent-pink"
                    : isSelected
                      ? "border-accent-teal text-foreground"
                      : "border-border text-foreground-muted hover:border-accent-teal"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>

      {!submitted ? (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={selected === null}
          className="mt-4 rounded bg-accent-teal px-5 py-2 font-mono text-xs font-bold text-background disabled:opacity-40"
        >
          SUBMIT ANSWER
        </button>
      ) : (
        <div className="mt-4">
          <p
            className={`font-mono text-sm font-bold ${isCorrect ? "text-accent-teal" : "text-accent-pink"}`}
          >
            {isCorrect ? "CORRECT" : "NOT QUITE"}
          </p>
          <p className="mt-2 text-sm text-foreground-muted">
            {question.explanation}
          </p>
        </div>
      )}
    </div>
  );
}
