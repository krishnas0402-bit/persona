// Supabase Edge Function: create-razorpay-order
// Deploy with: supabase functions deploy create-razorpay-order
//
// Creates a Razorpay order before checkout opens.
// Secrets needed (set via `supabase secrets set`):
//   RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PLAN_PRICES: Record<string, number> = {
  monthly: 29900,  // ₹299 in paise
  yearly: 199900,  // ₹1,999 in paise
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { userId, planId } = await req.json();

    // Validate plan
    const amount = PLAN_PRICES[planId];
    if (!amount) {
      return new Response(JSON.stringify({ error: "Invalid plan" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify the requesting user matches userId (auth check)
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user || user.id !== userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create Razorpay order
    const keyId = Deno.env.get("RAZORPAY_KEY_ID")!;
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET")!;
    const auth = btoa(`${keyId}:${keySecret}`);

    const orderRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        currency: "INR",
        receipt: `persona_${userId.slice(0, 8)}_${Date.now()}`,
        notes: { userId, planId },
      }),
    });

    if (!orderRes.ok) {
      const err = await orderRes.text();
      console.error("Razorpay order creation failed:", err);
      return new Response(JSON.stringify({ error: "Order creation failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const order = await orderRes.json();

    // Record order in DB (service role bypasses RLS)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    await supabaseAdmin.from("payment_orders").insert({
      user_id: userId,
      razorpay_order_id: order.id,
      plan: planId,
      amount,
      status: "created",
    });

    return new Response(JSON.stringify({ orderId: order.id, amount }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
