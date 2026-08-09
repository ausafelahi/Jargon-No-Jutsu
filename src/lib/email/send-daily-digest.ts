import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmailWithFallback } from "./send-with-fallback";
import { buildDigestEmail } from "./digest-template";

export interface SendDigestResult {
  lessonId: string;
  totalSubscribers: number;
  sent: number;
  failed: { email: string; error: string }[];
}

export async function sendDailyDigest(): Promise<SendDigestResult> {
  const supabase = createAdminClient();

  const { data: latestLessons, error: lessonError } = await supabase
    .from("lessons")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1);

  if (lessonError || !latestLessons?.[0]) {
    throw new Error(
      `No lesson to send: ${lessonError?.message ?? "table is empty"}`,
    );
  }
  const lesson = latestLessons[0];

  const { data: subscribers, error: subError } = await supabase
    .from("subscribers")
    .select("*");

  if (subError) {
    throw new Error(`Failed to fetch subscribers: ${subError.message}`);
  }

  const { subject, html } = buildDigestEmail(lesson);
  const failed: { email: string; error: string }[] = [];
  let sent = 0;

  for (const subscriber of subscribers ?? []) {
    const result = await sendEmailWithFallback({
      to: subscriber.email,
      subject,
      html,
    });
    if (result.success) {
      sent += 1;
    } else {
      const lastError = result.attempts.at(-1)?.error ?? "all providers failed";
      failed.push({ email: subscriber.email, error: lastError });
    }
  }

  return {
    lessonId: lesson.id,
    totalSubscribers: subscribers?.length ?? 0,
    sent,
    failed,
  };
}
