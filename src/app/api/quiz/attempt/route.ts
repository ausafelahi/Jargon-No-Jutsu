import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit/check";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (!claims) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = await checkRateLimit(claims.sub, {
    name: "quiz-attempt",
    limit: 30,
    windowSeconds: 60,
  });
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Try again shortly." },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  const questionId = body?.questionId as string | undefined;
  const selectedIndex = body?.selectedIndex as number | undefined;

  if (!questionId || selectedIndex === undefined) {
    return NextResponse.json(
      { error: "Missing questionId or selectedIndex" },
      { status: 400 },
    );
  }

  const { data: question, error: questionError } = await supabase
    .from("quiz_questions")
    .select("correct_index")
    .eq("id", questionId)
    .single();

  if (questionError || !question) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  const wasCorrect = selectedIndex === question.correct_index;

  const { error: upsertError } = await supabase.from("quiz_attempts").upsert(
    {
      user_id: claims.sub,
      question_id: questionId,
      selected_index: selectedIndex,
      was_correct: wasCorrect,
    },
    { onConflict: "user_id,question_id" },
  );

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 500 });
  }

  return NextResponse.json({
    correct: wasCorrect,
    correctIndex: question.correct_index,
  });
}
