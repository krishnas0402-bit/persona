import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { initiatePayment, PlanId } from "../lib/razorpay";
import { useUserStore } from "./userStore";

interface ProState {
  isPro: boolean;
  isProcessing: boolean;
  error: string | null;

  checkProStatus: () => Promise<void>;
  purchase: (planId: PlanId) => Promise<boolean>;
  restorePurchase: () => Promise<void>;
  clearError: () => void;
}

export const useProStore = create<ProState>((set, get) => ({
  isPro: false,
  isProcessing: false,
  error: null,

  checkProStatus: async () => {
    const userStore = useUserStore.getState();
    const { user } = userStore;
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("is_pro, pro_expires_at")
      .eq("id", user.id)
      .single();

    if (!data) return;

    const isPro =
      data.is_pro &&
      (!data.pro_expires_at || new Date(data.pro_expires_at) > new Date());

    set({ isPro });

    // Sync back to user store profile
    if (userStore.profile) {
      userStore.profile.is_pro = isPro;
    }
  },

  purchase: async (planId) => {
    const userStore = useUserStore.getState();
    const { user } = userStore;
    if (!user) return false;

    set({ isProcessing: true, error: null });

    const userEmail = user.email || "";
    const userName = userStore.profile?.id || "User";

    const result = await initiatePayment(user.id, userEmail, userName, planId);

    if (result.success) {
      // Refresh pro status after successful payment
      await get().checkProStatus();
      await userStore.loadProfile();
      set({ isProcessing: false, isPro: true });
      return true;
    } else {
      if (result.error !== "cancelled") {
        set({ error: result.error || "Payment failed", isProcessing: false });
      } else {
        set({ isProcessing: false });
      }
      return false;
    }
  },

  restorePurchase: async () => {
    // For Razorpay, check Supabase for active subscription
    await get().checkProStatus();
  },

  clearError: () => set({ error: null }),
}));
