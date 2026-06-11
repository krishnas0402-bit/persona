# PERSONA — Daily Identity Cards

> 60 seconds a day. One card. One identity. Compounding.

Full production codebase: React Native (Expo) + Supabase + Razorpay.

---

## What's In This Codebase

| Piece | Status |
|---|---|
| 8 screens (splash, login, onboarding ×2, home, card, analytics, store, profile) | ✅ Built |
| Magic-link email auth (no passwords) | ✅ Built |
| Real streak tracking synced to Postgres | ✅ Built |
| Daily card engine (deterministic per-day card) | ✅ Built |
| Razorpay payments with server-side signature verification | ✅ Built |
| Hard paywall + Pro gating throughout | ✅ Built |
| Daily push notification reminders | ✅ Built |
| Row Level Security + anti-tamper trigger on Pro columns | ✅ Built |

---

## Setup — Step by Step

### 1. Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) account (free tier is fine)
- A [Razorpay](https://razorpay.com) account (test mode works without KYC)
- Expo Go app on your phone for testing

### 2. Install dependencies
```bash
cd persona
npm install
```

### 3. Set up Supabase
1. Create a new project at supabase.com
2. Go to **SQL Editor** → paste the entire contents of `supabase/migrations/001_complete_setup.sql` → Run
3. Go to **Authentication → Providers** → enable **Email** (magic link is on by default)
4. Go to **Project Settings → API** → copy your URL and anon key

### 4. Set up environment
```bash
cp .env.example .env
# Fill in your Supabase URL, anon key, and Razorpay key ID
```

### 5. Deploy Edge Functions (payments)
```bash
npm install -g supabase
supabase login
supabase link --project-ref YOUR_PROJECT_REF

supabase secrets set RAZORPAY_KEY_ID=rzp_test_xxxxx
supabase secrets set RAZORPAY_KEY_SECRET=your_secret_here

supabase functions deploy create-razorpay-order
supabase functions deploy verify-payment
```

### 6. Run it
```bash
npx expo start
```
Scan the QR with Expo Go. 

> ⚠️ **Note:** `react-native-razorpay` needs a development build (not Expo Go) for actual payment testing:
> ```bash
> npx expo prebuild
> npx expo run:android   # or run:ios
> ```

---

## Going to Production

### Razorpay
1. Complete KYC on Razorpay dashboard (needs PAN + bank account; takes 2–4 days)
2. Switch from `rzp_test_` to `rzp_live_` keys in both `.env` and Supabase secrets

### App Stores
```bash
npm install -g eas-cli
eas login
eas build:configure

# Android (₹2,100 one-time Google Play fee)
eas build --platform android --profile production
eas submit --platform android

# iOS ($99/year Apple Developer fee)
eas build --platform ios --profile production
eas submit --platform ios
```

### Before submitting, you need:
- [ ] App icon 1024×1024 (replace `assets/icon.png`)
- [ ] Splash image (replace `assets/splash.png`)
- [ ] Privacy policy URL (required because of payments) — generate free at freeprivacypolicy.com
- [ ] 3–5 screenshots per platform
- [ ] Short + long store description

---

## Architecture

```
App (Expo Router)
 ├─ (auth) → splash → login (magic link) → onboard identity → onboard paywall
 ├─ (tabs) → home / analytics / store / profile
 └─ card/[id] → daily card with 5 tabs + complete button
        │
        ▼
Zustand stores (userStore, cardStore, proStore)
        │
        ▼
Supabase ── profiles, daily_completions, subscriptions, payment_orders
        │            (RLS on everything)
        ▼
Edge Functions ── create-razorpay-order → Razorpay checkout
                  verify-payment (HMAC verify) → activates is_pro
```

**Security model:**
- Users can never set `is_pro` themselves — a Postgres trigger blocks it; only the service-role Edge Function can after verifying the payment signature.
- Payment verification happens server-side with HMAC SHA256. The app never sees the Razorpay secret.

---

## Monetization Logic (as built)

| Tier | Gets |
|---|---|
| Free | 1 identity, base cards, streak |
| Pro ₹299/mo | All 5 identities, all packs, analytics breakdown, custom reminder times |
| Pro ₹1,999/yr | Same, 44% cheaper — positioned as default |

Paywall placement: onboarding step 2 (hard), home screen locked identities, analytics identity breakdown, store. Every locked surface routes to purchase.

---

## What's NOT included (deliberate scope cuts)

- iOS in-app purchase via Apple (Razorpay works for direct billing; for App Store compliance in some categories you may need StoreKit — check current Apple guidelines for your category)
- Social/sharing features
- AI-generated cards (card content is static; add via a `cards` table + admin panel later)
- Custom identity builder (marked "coming soon" in UI)
