import RazorpayCheckout from "react-native-razorpay";
import { supabase } from "./supabase";

const RAZORPAY_KEY_ID = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID!;

export const PLANS = {
  monthly: {
    id: "monthly",
    label: "Monthly",
    price: 29900, // in paise (₹299)
    displayPrice: "₹299",
    period: "per month",
    description: "Billed monthly",
  },
  yearly: {
    id: "yearly",
    label: "Yearly",
    price: 199900, // in paise (₹1,999)
    displayPrice: "₹1,999",
    period: "per year",
    description: "₹167/month · Save 44%",
    badge: "BEST VALUE",
  },
} as const;

export type PlanId = keyof typeof PLANS;

interface PaymentResult {
  success: boolean;
  paymentId?: string;
  error?: string;
}

export const initiatePayment = async (
  userId: string,
  userEmail: string,
  userName: string,
  planId: PlanId
): Promise<PaymentResult> => {
  try {
    const plan = PLANS[planId];

    // Step 1: Create order via Supabase Edge Function
    const { data: orderData, error: orderError } = await supabase.functions.invoke(
      "create-razorpay-order",
      {
        body: {
          userId,
          planId,
          amount: plan.price,
        },
      }
    );

    if (orderError || !orderData?.orderId) {
      throw new Error("Failed to create payment order");
    }

    // Step 2: Open Razorpay checkout
    const options = {
      description: `Persona Pro — ${plan.label}`,
      image: "https://yourapp.com/icon.png",
      currency: "INR",
      key: RAZORPAY_KEY_ID,
      amount: plan.price,
      name: "Persona",
      order_id: orderData.orderId,
      prefill: {
        email: userEmail,
        name: userName,
        contact: "",
      },
      theme: { color: "#b06aff" },
    };

    const paymentData = await RazorpayCheckout.open(options);

    // Step 3: Verify payment via Supabase Edge Function
    const { data: verifyData, error: verifyError } = await supabase.functions.invoke(
      "verify-payment",
      {
        body: {
          userId,
          planId,
          razorpay_order_id: orderData.orderId,
          razorpay_payment_id: paymentData.razorpay_payment_id,
          razorpay_signature: paymentData.razorpay_signature,
        },
      }
    );

    if (verifyError || !verifyData?.success) {
      throw new Error("Payment verification failed");
    }

    return { success: true, paymentId: paymentData.razorpay_payment_id };
  } catch (error: any) {
    // Razorpay throws error with code when user cancels
    if (error?.code === "PAYMENT_CANCELLED") {
      return { success: false, error: "cancelled" };
    }
    return { success: false, error: error?.message || "Payment failed" };
  }
};
