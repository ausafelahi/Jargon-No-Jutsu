import { NextRequest, NextResponse } from "next/server";
import { sendDailyDigest } from "@/lib/email/send-daily-digest";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit/check";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const { allowed } = await checkRateLimit(ip, {
    name: "send-email",
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

  if (process.env.EMAIL_DELIVERY_ENABLED !== "true") {
    return NextResponse.json(
      {
        error: "Email delivery is disabled (EMAIL_DELIVERY_ENABLED != 'true')",
      },
      { status: 403 },
    );
  }

  try {
    const result = await sendDailyDigest();
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Digest send failed" },
      { status: 500 },
    );
  }
}
