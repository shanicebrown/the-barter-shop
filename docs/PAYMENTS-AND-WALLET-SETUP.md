# Subscriptions, Founding Members & Barter Bucks — setup

The code is done. These are the account and dashboard steps only you can do, in order.

## 1. Database (5 minutes)

Supabase Dashboard → **SQL Editor → New query** → paste all of
`supabase/migration-v15-wallet-founding-iap.sql` → **Run**.

(v2–v14 are already applied to the live project. v15 is safe to re-run.)

## 2. Founding members (whenever you're ready)

Supabase Dashboard → **Table Editor → `founding_members` → Insert → Import data from CSV**.
Use `supabase/founding_members_template.csv` as the format:

| column | value |
|---|---|
| `email` | the address they'll sign up with (case doesn't matter) |
| `tier` | `verified_pro` or `business` (defaults to `verified_pro`) |
| `note` | optional, for your records |

- **Already has an account?** Access turns on the moment you upload.
- **Signs up later?** Access turns on when they confirm their email.
- The 12 months start at activation, so late joiners still get a full year.
- In the app they see a "Founding Member — free until …" banner on Membership.

## 3. Store products

Create the same two auto-renewing monthly subscriptions in both stores, in one
subscription group ("Membership") on iOS, each with a **1-month free trial** introductory offer:

| Product ID | Price |
|---|---|
| `thebartershop.verified_pro.monthly` | $9.00 / month |
| `thebartershop.business.monthly` | $49.99 / month |

- **App Store Connect** → your app → Subscriptions. Also sign the Paid Apps agreement and add banking/tax info, or products never load.
- **Google Play Console** → your app → Monetize → Subscriptions.

## 4. RevenueCat (free until $2.5k/month revenue)

1. Create a project at revenuecat.com and add the iOS and Android apps (bundle/package `com.thebartershop.app`). Connect App Store Connect and Play Console credentials as RevenueCat's setup screens ask.
2. **Entitlements:** create `verified_pro` and `business`. Attach each product to its entitlement.
3. **Offerings:** make the *current* offering contain two packages with identifiers `verified_pro_monthly` and `business_monthly`.
4. **API keys:** copy the two *public* SDK keys into `.env` (see `.env.example`). Copy the *secret* API key for step 5.
5. **Webhook:** Project → Integrations → Webhooks → URL
   `https://idbiikbesfwceavainsa.supabase.co/functions/v1/sync-subscription`,
   Authorization header value: `Bearer <a long random string you generate>`.

## 5. Deploy the sync function

```bash
npx supabase login
npx supabase secrets set --project-ref idbiikbesfwceavainsa REVENUECAT_SECRET_KEY=sk_xxx REVENUECAT_WEBHOOK_AUTH=<same random string as the webhook>
npx supabase functions deploy sync-subscription --project-ref idbiikbesfwceavainsa --no-verify-jwt
```

`--no-verify-jwt` is required: RevenueCat doesn't send a Supabase token. The function checks
the webhook secret itself, and app calls are verified against the member's session.

## 5b. Barter Bucks packs (Stripe)

Packs: **5 for $5.00, 20 for $10.00, 50 for $19.99** (prices are set in
`supabase/functions/bb-checkout/index.ts`; the app can't change them).

1. Stripe Dashboard → Developers → Webhooks → **Add endpoint**:
   `https://idbiikbesfwceavainsa.supabase.co/functions/v1/stripe-webhook`
   Events: `payment_intent.succeeded`, `payment_intent.payment_failed`,
   `payment_intent.canceled`, `charge.refunded`. Copy the signing secret (`whsec_…`).
2. Deploy:

```bash
npx supabase secrets set --project-ref idbiikbesfwceavainsa STRIPE_SECRET_KEY=sk_test_xxx STRIPE_WEBHOOK_SECRET=whsec_xxx
npx supabase functions deploy bb-checkout --project-ref idbiikbesfwceavainsa
npx supabase functions deploy stripe-webhook --project-ref idbiikbesfwceavainsa --no-verify-jwt
```

3. Put the matching publishable key in `.env` as `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
   Test end to end in **test mode first** (card `4242 4242 4242 4242`, any future date, any CVC),
   then switch all three Stripe values to live keys together — a live publishable key
   with a test secret key (or the reverse) fails.

**Why Stripe and not Apple/Google for packs:** purchased Barter Bucks pay for real-world
services between members, and store rules require those payments to go *outside* in-app
purchase. That's also why purchased Barter Bucks can't buy perks (digital perks must use in-app
purchase). In App Store Connect → App Review Information → Notes, add something like:
*"Barter Bucks packs are purchased with Stripe because they can only be used to pay another
member for a real-world service (Guideline 3.1.3(e)). They cannot unlock digital content or
perks; perks use non-purchasable earned Barter Bucks only."*

## 6. Test real purchases (needs a development build, not Expo Go)

```bash
npx eas-cli login
npx eas-cli build --profile development --platform ios
```

Install the build, sign in, open **Profile → Settings → Membership**, and buy with a
Sandbox tester account (App Store Connect → Users and Access → Sandbox). Sandbox renewals are
fast (a "month" lasts minutes), which is a quick way to see renewal and expiry flow through.

In Expo Go, RevenueCat runs in a preview mode: the plan screen works, but nothing is charged.

## How it fits together

- **Tier** = the higher of an active store subscription and an active founding membership,
  computed on the server by `my_entitlement()`. The app can't change its own tier.
- **Barter Bucks** live in a server ledger (`bb_transactions`) with two kinds:
  - *Earned* — 5 welcome bonus on email confirmation, completed barter +2/+1, five-star review +1,
    verification +5, 100% profile +2. Usable for perks and trades.
  - *Purchased* — Stripe packs, credited only by the Stripe webhook. Usable only to cover a
    difference in a signed barter (1 BB = $1), applied before earned ones.
  Perks are spent through `bb_redeem_perk`; partners can move Barter Bucks only through a
  signed agreement (`bb_settle_gap`). Reputation tiers count earned Barter Bucks only. The app
  can't edit balances.

## Not built yet

- **48-hour guarantee trial extension.** The copy promises it; nothing grants it yet. It needs a
  scheduled server job that finds paid members with no match after 48 hours and grants a 30-day
  RevenueCat promotional entitlement through RevenueCat's REST API.
- **Perk effects.** Redeeming a perk is recorded (`bb_perk_redemptions`), but boost and featured
  placement only take effect once listings come from the database instead of demo data.
