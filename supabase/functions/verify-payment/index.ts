// Supabase Edge Function: verify-payment
// Deploy with: supabase functions deploy verify-payment
//
// Verifies Razorpay payment signature (HMAC SHA256) and activates Pro.
// Secrets needed: RAZORPAY_KEY_SECRET

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PLAN_DURATION_DAYS: Record<string, number> = {
  monthly: 30,
  yearly: 365,
};

const PLAN_PRICES: Record<string, number> = {
  monthly: 29900,
  yearly: 199900,
};

// HMAC SHA256 signature verification
async function verifySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const data = encoder.encode(`${orderId}|${paymentId}`);
  const signed = await crypto.subtle.sign("HMAC", key, data);
  const expected = Array.from(new Uint8Array(signed))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return expected === signature;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const {
      userId,
      planId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = await req.json();

    // 1. Verify auth — requester must match userId
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user || user.id !== userId) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Verify Razorpay signature
    const secret = Deno.env.get("RAZORPAY_KEY_SECRET")!;
    const valid = await verifySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      secret
    );

    if (!valid) {
      return new Response(JSON.stringify({ success: false, error: "Invalid signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Verify the order exists and belongs to this user
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: order } = await supabaseAdmin
      .from("payment_orders")
      .select("*")
      .eq("razorpay_order_id", razorpay_order_id)
      .eq("user_id", userId)
      .single();

    if (!order || order.status === "paid") {
      return new Response(JSON.stringify({ success: false, error: "Invalid or already-used order" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 4. Calculate expiry & activate
    const durationDays = PLAN_DURATION_DAYS[planId] ?? 30;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationDays);

    // Create subscription record
    await supabaseAdmin.from("subscriptions").insert({
      user_id: userId,
      razorpay_order_id,
      razorpay_payment_id,
      plan: planId,
      status: "active",
      expires_at: expiresAt.toISOString(),
      amount: PLAN_PRICES[planId] ?? 0,
    });

    // Mark order paid
    await supabaseAdmin
      .from("payment_orders")
      .update({ status: "paid" })
      .eq("razorpay_order_id", razorpay_order_id);

    // Activate Pro on profile (service role bypasses the protect trigger)
    await supabaseAdmin
      .from("profiles")
      .update({
        is_pro: true,
        pro_expires_at: expiresAt.toISOString(),
      })
      .eq("id", userId);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ success: false, error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
