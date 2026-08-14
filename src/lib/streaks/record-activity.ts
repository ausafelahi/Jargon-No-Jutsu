import { createAdminClient } from "@/lib/supabase/admin";

export interface StreakState {
  currentStreak: number;
  longestStreak: number;
}

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayUtc(): string {
  return new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export async function recordDailyActivity(
  userId: string,
): Promise<StreakState> {
  const supabase = createAdminClient();
  const today = todayUtc();

  const { data: existing, error: fetchError } = await supabase
    .from("user_streaks")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (fetchError) {
    throw new Error(`Failed to read streak: ${fetchError.message}`);
  }

  if (!existing) {
    const { error: insertError } = await supabase.from("user_streaks").insert({
      user_id: userId,
      current_streak: 1,
      longest_streak: 1,
      last_active_date: today,
    });
    if (insertError) {
      throw new Error(`Failed to create streak: ${insertError.message}`);
    }
    return { currentStreak: 1, longestStreak: 1 };
  }

  if (existing.last_active_date === today) {
    return {
      currentStreak: existing.current_streak,
      longestStreak: existing.longest_streak,
    };
  }

  const continuingStreak = existing.last_active_date === yesterdayUtc();
  const newCurrent = continuingStreak ? existing.current_streak + 1 : 1;
  const newLongest = Math.max(existing.longest_streak, newCurrent);

  const { error: updateError } = await supabase
    .from("user_streaks")
    .update({
      current_streak: newCurrent,
      longest_streak: newLongest,
      last_active_date: today,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (updateError) {
    throw new Error(`Failed to update streak: ${updateError.message}`);
  }

  return { currentStreak: newCurrent, longestStreak: newLongest };
}
