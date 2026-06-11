import { create } from "zustand";
import {
  hasCompletedToday,
  markTodayComplete,
  getCompletionHistory,
  getTodayString,
  DailyCompletion,
} from "../lib/supabase";
import { useUserStore } from "./userStore";
import { getDailyCard } from "../constants/cards";
import { IdentityId } from "../constants/theme";
import { Card } from "../constants/cards";

interface CardState {
  todayCard: Card | null;
  todayCardIndex: number;
  completedToday: boolean;
  history: DailyCompletion[];
  isLoading: boolean;

  loadTodayCard: (identityId: IdentityId) => void;
  checkTodayStatus: () => Promise<void>;
  completeToday: () => Promise<void>;
  loadHistory: () => Promise<void>;
}

export const useCardStore = create<CardState>((set, get) => ({
  todayCard: null,
  todayCardIndex: 0,
  completedToday: false,
  history: [],
  isLoading: false,

  loadTodayCard: (identityId) => {
    const today = getTodayString();
    const { card, index } = getDailyCard(identityId, today);
    set({ todayCard: card, todayCardIndex: index });
  },

  checkTodayStatus: async () => {
    const { user } = useUserStore.getState();
    if (!user) return;
    const completed = await hasCompletedToday(user.id);
    set({ completedToday: completed });
  },

  completeToday: async () => {
    const { user, profile } = useUserStore.getState();
    if (!user || !profile) return;

    const identityId = profile.primary_identity as IdentityId;
    const { todayCardIndex } = get();

    await markTodayComplete(user.id, identityId, todayCardIndex);

    // Reload profile to get updated streak
    await useUserStore.getState().loadProfile();
    set({ completedToday: true });
  },

  loadHistory: async () => {
    const { user } = useUserStore.getState();
    if (!user) return;
    set({ isLoading: true });
    const history = await getCompletionHistory(user.id, 30);
    set({ history, isLoading: false });
  },
}));
