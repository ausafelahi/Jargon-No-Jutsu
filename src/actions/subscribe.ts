"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export interface SubscribeResult {
  success: boolean;
  error?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function subscribe(formData: FormData): Promise<SubscribeResult> {
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
