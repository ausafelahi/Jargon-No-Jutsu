"use server";

import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit/check";

export interface SubscribeResult {
  success: boolean;
  error?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function subscribe(formData: FormData): Promise<SubscribeResult> {
  const requestHeaders = await headers();
  const ip = getClientIp(requestHeaders);
  const { allowed } = await checkRateLimit(ip, {
    name: "subscribe",
    limit: 5,
    windowSeconds: 300,
  });
  if (!allowed) {
    return {
      success: false,
      error: "Too many attempts. Try again in a few minutes.",
    };
  }

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!EMAIL_PATTERN.test(email)) {
    return { success: false, error: "Enter a valid email address." };
  }
  const supabase = createAdminClient();
  const { error } = await supabase.from("subscribers").insert({ email });

  if (error) {
    if (error.code === "23505") {
      return { success: true };
    }
    return { success: false, error: "Something went wrong. Try again." };
  }

  return { success: true };
}
