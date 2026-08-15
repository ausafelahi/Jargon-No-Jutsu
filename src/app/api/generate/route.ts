import { NextRequest, NextResponse } from "next/server";
import { generateDailyLesson } from "@/lib/ai/generate-daily-lesson";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit/check";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const { allowed } = await checkRateLimit(ip, {
    name: "generate",
    limit: 5,
    windowSeconds: 60,
  });
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Try again shortly." },
      { status: 429 },
    );
  }

  const authHeader = request.headers.get("authorization");
  const expected = `Bearer ${process.env.GENERATE_API_SECRET}`;

  if (!process.env.GENERATE_API_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (process.env.LESSON_GENERATION_ENABLED !== "true") {
    return NextResponse.json(
      {
        error:
          "Lesson generation is disabled (LESSON_GENERATION_ENABLED != 'true')",
      },
      { status: 403 },
    );
  }

  try {
    const { lesson } = await generateDailyLesson();
    return NextResponse.json({ lesson }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Generation failed" },
      { status: 500 },
    );
  }
}
