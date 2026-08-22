import { createAdminClient } from "@/lib/supabase/admin";

export interface StreakState {
  currentStreak: number;
  longestStreak: number;
}

export interface ExistingStreak {
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
}

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayUtc(): string {
  return new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export function computeNextStreak(
  existing: ExistingStreak | null,
  today: string,
  yesterday: string,
): StreakState {
  if (!existing) {
    return { currentStreak: 1, longestStreak: 1 };
  }

  if (existing.last_active_date === today) {
    return {
      currentStreak: existing.current_streak,
      longestStreak: existing.longest_streak,
    };
  }

  const continuingStreak = existing.last_active_date === yesterday;
  const newCurrent = continuingStreak ? existing.current_streak + 1 : 1;
  const newLongest = Math.max(existing.longest_streak, newCurrent);

  return { currentStreak: newCurrent, longestStreak: newLongest };
}

export async function recordDailyActivity(
  userId: string,
): Promise<StreakState> {
  const supabase = createAdminClient();
  const today = todayUtc();
  const yesterday = yesterdayUtc();

  const { data: existing, error: fetchError } = await supabase
    .from("user_streaks")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (fetchError) {
    throw new Error(`Failed to read streak: ${fetchError.message}`);
  }

  const next = computeNextStreak(existing, today, yesterday);

  if (!existing) {
    const { error: insertError } = await supabase.from("user_streaks").insert({
      user_id: userId,
      current_streak: next.currentStreak,
      longest_streak: next.longestStreak,
      last_active_date: today,
    });
    if (insertError) {
      throw new Error(`Failed to create streak: ${insertError.message}`);
    }
    return next;
  }

  if (existing.last_active_date === today) {
    return next;
  }

  const { error: updateError } = await supabase
    .from("user_streaks")
    .update({
      current_streak: next.currentStreak,
      longest_streak: next.longestStreak,
      last_active_date: today,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (updateError) {
    throw new Error(`Failed to update streak: ${updateError.message}`);
  }

  return next;
}
