// Starts a Barter Bucks pack purchase for the signed-in member.
// Returns a Stripe PaymentIntent client secret for the app's PaymentSheet.
// Barter Bucks are credited later by `stripe-webhook`, never by this function.
//
// Secrets: STRIPE_SECRET_KEY
// Provided automatically: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

// Prices live on the server so the app can't change them.
export const PACKS = {
  bb_5: { bb: 5, cents: 500 },
  bb_20: { bb: 20, cents: 1000 },
  bb_50: { bb: 50, cents: 1999 },
} as const;
type Pack = keyof typeof PACKS;

const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
  auth: { persistSession: false },
});

async function stripe(path: string, params: Record<string, string>, idempotencyKey: string) {
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${Deno.env.get('STRIPE_SECRET_KEY')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Idempotency-Key': idempotencyKey,
    },
    body: new URLSearchParams(params),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message ?? `Stripe ${res.status}`);
  return json;
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  try {
    const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
    const { data: auth, error: authError } = await admin.auth.getUser(token);
    if (authError || !auth.user) return new Response('Unauthorized', { status: 401 });

    const { pack } = await req.json().catch(() => ({}));
    if (!(pack in PACKS)) return Response.json({ error: 'Unknown pack' }, { status: 400 });
    const { bb, cents } = PACKS[pack as Pack];

    const { data: purchase, error: insertError } = await admin
      .from('bb_purchases')
      .insert({ user_id: auth.user.id, pack, bb_amount: bb, amount_cents: cents })
      .select('id')
      .single();
    if (insertError) throw insertError;

    const intent = await stripe('payment_intents', {
      amount: String(cents),
      currency: 'usd',
      'automatic_payment_methods[enabled]': 'true',
      description: `${bb} Barter Bucks`,
      'metadata[kind]': 'barter_bucks',
      'metadata[purchase_id]': purchase.id,
      'metadata[user_id]': auth.user.id,
      'metadata[pack]': pack,
    }, purchase.id);

    const { error: updateError } = await admin
      .from('bb_purchases')
      .update({ stripe_payment_intent: intent.id })
      .eq('id', purchase.id);
    if (updateError) throw updateError;

    return Response.json({ clientSecret: intent.client_secret, purchaseId: purchase.id, bb, amountCents: cents });
  } catch (e) {
    console.error('bb-checkout failed:', e);
    return Response.json({ error: 'Could not start checkout' }, { status: 500 });
  }
});
