// Keeps profiles.subscription_* in sync with Apple / Google via RevenueCat.
//
// Two callers:
//  1. RevenueCat webhook  — Authorization: Bearer <REVENUECAT_WEBHOOK_AUTH>
//  2. The app, right after a purchase/restore — Authorization: Bearer <user JWT>
//
// Either way the function re-reads the subscriber from RevenueCat's API and
// writes the result, so event order and payload contents don't matter.
//
// Secrets (supabase secrets set ...): REVENUECAT_SECRET_KEY, REVENUECAT_WEBHOOK_AUTH
// Provided automatically: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const ENTITLEMENT_TIERS = ['business', 'verified_pro'] as const; // highest first
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
  auth: { persistSession: false },
});

type RcEntitlement = { expires_date: string | null; product_identifier: string };
type RcSubscription = {
  store: string;
  period_type: 'trial' | 'intro' | 'normal';
  expires_date: string | null;
  unsubscribe_detected_at: string | null;
  billing_issues_detected_at: string | null;
  store_transaction_id?: string;
};

async function fetchSubscriber(appUserId: string) {
  const res = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(appUserId)}`, {
    headers: { Authorization: `Bearer ${Deno.env.get('REVENUECAT_SECRET_KEY')}` },
  });
  if (!res.ok) throw new Error(`RevenueCat ${res.status}: ${await res.text()}`);
  return (await res.json()).subscriber as {
    entitlements: Record<string, RcEntitlement>;
    subscriptions: Record<string, RcSubscription>;
  };
}

function storeName(store: string | undefined) {
  if (store === 'app_store' || store === 'mac_app_store') return 'app_store';
  if (store === 'play_store') return 'play_store';
  return 'promotional';
}

async function syncUser(userId: string) {
  const sub = await fetchSubscriber(userId);
  const now = Date.now();
  const active = (e?: RcEntitlement) => !!e && (e.expires_date === null || Date.parse(e.expires_date) > now);

  const tier = ENTITLEMENT_TIERS.find((t) => active(sub.entitlements[t]));
  if (!tier) {
    const hadAny = ENTITLEMENT_TIERS.some((t) => sub.entitlements[t]);
    await apply(userId, 'freemium', hadAny ? 'expired' : 'free', null, null, null);
    return { tier: 'freemium' };
  }

  const ent = sub.entitlements[tier];
  const s = sub.subscriptions[ent.product_identifier];
  const status = s?.billing_issues_detected_at
    ? 'past_due'
    : s?.unsubscribe_detected_at
      ? 'cancelled'
      : s?.period_type === 'trial'
        ? 'trial'
        : 'active';
  await apply(userId, tier, status, ent.expires_date, storeName(s?.store), s?.store_transaction_id ?? null);
  return { tier, status };
}

async function apply(
  userId: string, tier: string, status: string, expiresAt: string | null, store: string | null, txId: string | null,
) {
  const { error } = await admin.rpc('apply_store_subscription', {
    p_user: userId, p_tier: tier, p_status: status, p_expires_at: expiresAt, p_store: store, p_transaction_id: txId,
  });
  if (error) throw error;
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const auth = req.headers.get('Authorization') ?? '';
  const token = auth.replace(/^Bearer\s+/i, '');

  try {
    // 1. RevenueCat webhook
    if (token && token === Deno.env.get('REVENUECAT_WEBHOOK_AUTH')) {
      const { event } = await req.json();
      const ids: string[] = [event?.app_user_id, ...(event?.transferred_to ?? []), ...(event?.transferred_from ?? [])]
        .filter((id: unknown): id is string => typeof id === 'string' && UUID.test(id));
      for (const id of new Set(ids)) await syncUser(id);
      return Response.json({ ok: true, synced: ids.length });
    }

    // 2. Signed-in app user asking for their own sync
    const { data, error } = await admin.auth.getUser(token);
    if (error || !data.user) return new Response('Unauthorized', { status: 401 });
    const result = await syncUser(data.user.id);
    return Response.json({ ok: true, ...result });
  } catch (e) {
    console.error('sync-subscription failed:', e);
    return Response.json({ ok: false, error: String((e as Error).message ?? e) }, { status: 500 });
  }
});
