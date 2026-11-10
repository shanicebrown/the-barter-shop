// Stripe → Barter Bucks. Credits a purchase only after Stripe confirms payment.
//
// Stripe Dashboard → Developers → Webhooks → endpoint URL:
//   https://<project>.supabase.co/functions/v1/stripe-webhook
// Events: payment_intent.succeeded, payment_intent.payment_failed,
//         payment_intent.canceled, charge.refunded
//
// Secrets: STRIPE_WEBHOOK_SECRET (whsec_...)
// Provided automatically: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
// Deploy with --no-verify-jwt (Stripe can't send a Supabase token; the
// Stripe-Signature header is verified below instead).
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const TOLERANCE_SECONDS = 300;

const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
  auth: { persistSession: false },
});

const hex = (buf: ArrayBuffer) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Verifies Stripe's `t=…,v1=…` signature over the raw body. */
export async function verifyStripeSignature(rawBody: string, header: string | null, secret: string, now = Date.now()) {
  if (!header) return false;
  const parts = Object.fromEntries(
    header.split(',').map((p) => p.split('=') as [string, string]).filter(([k]) => k === 't'),
  );
  const signatures = header.split(',').filter((p) => p.startsWith('v1=')).map((p) => p.slice(3));
  const timestamp = Number(parts.t);
  if (!timestamp || !signatures.length) return false;
  if (Math.abs(now / 1000 - timestamp) > TOLERANCE_SECONDS) return false;

  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const expected = hex(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${timestamp}.${rawBody}`)));
  return signatures.some((s) => timingSafeEqual(s, expected));
}

async function rpc(fn: string, args: Record<string, unknown>) {
  const { data, error } = await admin.rpc(fn, args);
  if (error) throw new Error(`${fn}: ${error.message}`);
  return data;
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const raw = await req.text();
  const ok = await verifyStripeSignature(raw, req.headers.get('Stripe-Signature'), Deno.env.get('STRIPE_WEBHOOK_SECRET')!);
  if (!ok) return new Response('Bad signature', { status: 400 });

  const event = JSON.parse(raw);
  const obj = event.data?.object ?? {};
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        if (obj.metadata?.kind !== 'barter_bucks') break;
        await rpc('bb_credit_purchase', { p_payment_intent: obj.id, p_amount_received: obj.amount_received });
        break;
      case 'payment_intent.payment_failed':
      case 'payment_intent.canceled':
        if (obj.metadata?.kind !== 'barter_bucks') break;
        await rpc('bb_fail_purchase', { p_payment_intent: obj.id });
        break;
      case 'charge.refunded':
        // Full refunds reverse the unspent Barter Bucks; partial refunds are left to support.
        if (obj.payment_intent && obj.amount_refunded >= obj.amount) {
          await rpc('bb_refund_purchase', { p_payment_intent: obj.payment_intent });
        }
        break;
    }
    return Response.json({ received: true });
  } catch (e) {
    // 500 makes Stripe retry; every handler above is idempotent.
    console.error('stripe-webhook failed:', event.type, e);
    return Response.json({ error: String((e as Error).message ?? e) }, { status: 500 });
  }
});
