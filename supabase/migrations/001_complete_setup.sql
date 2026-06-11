-- ════════════════════════════════════════════════════════════════
-- PERSONA — Complete Database Setup
-- Run this entire file in Supabase SQL Editor (or via supabase db push)
-- ════════════════════════════════════════════════════════════════

-- ─── 1. PROFILES ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  primary_identity TEXT NOT NULL DEFAULT 'disciplined'
    CHECK (primary_identity IN ('disciplined', 'wealthy', 'creative', 'athletic', 'serene')),
  secondary_identity TEXT
    CHECK (secondary_identity IN ('disciplined', 'wealthy', 'creative', 'athletic', 'serene')),
  streak_current INT DEFAULT 0,
  streak_best INT DEFAULT 0,
  streak_last_completed DATE,
  is_pro BOOLEAN DEFAULT FALSE,
  pro_expires_at TIMESTAMPTZ,
  notification_enabled BOOLEAN DEFAULT TRUE,
  notification_time TIME DEFAULT '07:00:00',
  onboarded BOOLEAN DEFAULT FALSE
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── 2. DAILY COMPLETIONS ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.daily_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  completed_date DATE NOT NULL DEFAULT CURRENT_DATE,
  identity_id TEXT NOT NULL,
  card_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, completed_date)
);

CREATE INDEX IF NOT EXISTS idx_completions_user_date
  ON public.daily_completions(user_id, completed_date DESC);

-- ─── 3. SUBSCRIPTIONS ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT UNIQUE,
  plan TEXT NOT NULL CHECK (plan IN ('monthly', 'yearly')),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'cancelled', 'expired', 'pending')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  amount INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user
  ON public.subscriptions(user_id, status);

-- ─── 4. PAYMENT ORDERS (pre-checkout tracking) ───────────────────

CREATE TABLE IF NOT EXISTS public.payment_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  razorpay_order_id TEXT UNIQUE NOT NULL,
  plan TEXT NOT NULL,
  amount INT NOT NULL,
  status TEXT DEFAULT 'created' CHECK (status IN ('created', 'paid', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 5. ROW LEVEL SECURITY ───────────────────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_orders ENABLE ROW LEVEL SECURITY;

-- Profiles: read/update own only
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Completions: full control over own rows
DROP POLICY IF EXISTS "completions_all_own" ON public.daily_completions;
CREATE POLICY "completions_all_own"
  ON public.daily_completions FOR ALL USING (auth.uid() = user_id);

-- Subscriptions: read own only (writes happen via service role in Edge Functions)
DROP POLICY IF EXISTS "subscriptions_select_own" ON public.subscriptions;
CREATE POLICY "subscriptions_select_own"
  ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Payment orders: read own only
DROP POLICY IF EXISTS "orders_select_own" ON public.payment_orders;
CREATE POLICY "orders_select_own"
  ON public.payment_orders FOR SELECT USING (auth.uid() = user_id);

-- ─── 6. IMPORTANT SECURITY NOTE ──────────────────────────────────
-- is_pro and pro_expires_at on profiles should ONLY be set by the
-- verify-payment Edge Function (service role). The profiles_update_own
-- policy above technically allows users to update any column on their
-- own row. Lock down pro columns with a trigger:

CREATE OR REPLACE FUNCTION public.protect_pro_columns()
RETURNS TRIGGER AS $$
BEGIN
  -- Only allow is_pro / pro_expires_at changes from service role
  IF (NEW.is_pro IS DISTINCT FROM OLD.is_pro
      OR NEW.pro_expires_at IS DISTINCT FROM OLD.pro_expires_at)
     AND auth.role() != 'service_role' THEN
    NEW.is_pro := OLD.is_pro;
    NEW.pro_expires_at := OLD.pro_expires_at;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS protect_pro_trigger ON public.profiles;
CREATE TRIGGER protect_pro_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_pro_columns();
