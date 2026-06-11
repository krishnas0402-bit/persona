import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ─── Types ────────────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  created_at: string;
  primary_identity: string;
  secondary_identity: string | null;
  streak_current: number;
  streak_best: number;
  streak_last_completed: string | null;
  is_pro: boolean;
  pro_expires_at: string | null;
  notification_enabled: boolean;
  notification_time: string;
  onboarded: boolean;
}

export interface DailyCompletion {
  id: string;
  user_id: string;
  completed_date: string;
  identity_id: string;
  card_index: number;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  razorpay_subscription_id: string;
  razorpay_payment_id: string;
  plan: "monthly" | "yearly";
  status: "active" | "cancelled" | "expired";
  started_at: string;
  expires_at: string;
  amount: number;
}

// ─── Profile helpers ──────────────────────────────────────────────────────

export const getProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) return null;
  return data;
};

export const updateProfile = async (
  userId: string,
  updates: Partial<Profile>
): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const createProfile = async (userId: string, primaryIdentity: string): Promise<Profile> => {
  const { data, error } = await supabase
    .from("profiles")
    .insert({ id: userId, primary_identity: primaryIdentity })
    .select()
    .single();
  if (error) throw error;
  return data;
};

// ─── Streak helpers ───────────────────────────────────────────────────────

export const getTodayString = (): string => {
  return new Date().toISOString().split("T")[0];
};

export const hasCompletedToday = async (userId: string): Promise<boolean> => {
  const today = getTodayString();
  const { data } = await supabase
    .from("daily_completions")
    .select("id")
    .eq("user_id", userId)
    .eq("completed_date", today)
    .single();
  return !!data;
};

export const markTodayComplete = async (
  userId: string,
  identityId: string,
  cardIndex: number
): Promise<void> => {
  const today = getTodayString();

  // Insert completion
  await supabase.from("daily_completions").upsert({
    user_id: userId,
    completed_date: today,
    identity_id: identityId,
    card_index: cardIndex,
  });

  // Get current profile for streak calculation
  const profile = await getProfile(userId);
  if (!profile) return;

  const lastCompleted = profile.streak_last_completed;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  let newStreak = 1;
  if (lastCompleted === yesterdayStr) {
    newStreak = (profile.streak_current || 0) + 1;
  } else if (lastCompleted === today) {
    newStreak = profile.streak_current; // Already done today
    return;
  }

  await updateProfile(userId, {
    streak_current: newStreak,
    streak_best: Math.max(newStreak, profile.streak_best || 0),
    streak_last_completed: today,
  });
};

export const getCompletionHistory = async (
  userId: string,
  days: number = 30
): Promise<DailyCompletion[]> => {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data } = await supabase
    .from("daily_completions")
    .select("*")
    .eq("user_id", userId)
    .gte("completed_date", since.toISOString().split("T")[0])
    .order("completed_date", { ascending: false });

  return data || [];
};
