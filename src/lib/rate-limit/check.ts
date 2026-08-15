import { createAdminClient } from "@/lib/supabase/admin";

export interface RateLimitConfig {
  name: string;
  limit: number;
  windowSeconds: number;
}

export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig,
): Promise<{ allowed: boolean }> {
  const supabase = createAdminClient();
  const key = `${config.name}:${identifier}`;

  const { data, error } = await supabase.rpc("check_rate_limit", {
    p_key: key,
    p_limit: config.limit,
    p_window_seconds: config.windowSeconds,
  });

  if (error) {
    console.warn(
      `Rate limit check failed for "${key}", allowing request:`,
      error.message,
    );
    return { allowed: true };
  }

  return { allowed: data === true };
}

export function getClientIp(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  }
  return headers.get("x-real-ip") ?? "unknown";
}
