import { create } from "zustand";
import { Session, User } from "@supabase/supabase-js";
import { supabase, Profile, getProfile, updateProfile, createProfile } from "../lib/supabase";
import { IdentityId } from "../constants/theme";

interface UserState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  setSession: (session: Session | null) => void;
  loadProfile: () => Promise<void>;
  updateIdentity: (identityId: IdentityId, isPrimary: boolean) => Promise<void>;
  updateNotifications: (enabled: boolean, time: string) => Promise<void>;
  setOnboarded: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  isLoading: true,
  isInitialized: false,

  setSession: (session) => {
    set({ session, user: session?.user ?? null });
  },

  loadProfile: async () => {
    const { user } = get();
    if (!user) {
      set({ isLoading: false, isInitialized: true });
      return;
    }
    set({ isLoading: true });
    const profile = await getProfile(user.id);
    set({ profile, isLoading: false, isInitialized: true });
  },

  updateIdentity: async (identityId, isPrimary) => {
    const { user, profile } = get();
    if (!user) return;

    const updates = isPrimary
      ? { primary_identity: identityId }
      : { secondary_identity: identityId };

    const updated = await updateProfile(user.id, updates);
    set({ profile: updated });
  },

  updateNotifications: async (enabled, time) => {
    const { user } = get();
    if (!user) return;
    const updated = await updateProfile(user.id, {
      notification_enabled: enabled,
      notification_time: time,
    });
    set({ profile: updated });
  },

  setOnboarded: async () => {
    const { user } = get();
    if (!user) return;
    const updated = await updateProfile(user.id, { onboarded: true });
    set({ profile: updated });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, profile: null });
  },
}));
