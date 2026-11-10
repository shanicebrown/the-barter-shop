import { supabase } from '../config/supabase';

export type SubscriptionPlan = 'verified_pro' | 'business';

// Note: In production, payment intent creation MUST happen on the server
// (Supabase Edge Function) using the secret key. Never use sk_live on client.

export async function updateSubscription(
  userId: string,
  plan: SubscriptionPlan,
  stripeCustomerId?: string,
  subscriptionId?: string,
): Promise<void> {
  try {
    await supabase.from('profiles').update({
      subscription_tier: plan,
      subscription_status: 'active',
      stripe_customer_id: stripeCustomerId,
      subscription_id: subscriptionId,
      subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      verification_status: 'pending_review',
    }).eq('id', userId);
  } catch (e) {
    console.log('Subscription update error:', e);
    throw e;
  }
}

export async function cancelSubscription(userId: string): Promise<void> {
  try {
    await supabase.from('profiles').update({
      subscription_tier: 'freemium',
      subscription_status: 'cancelled',
    }).eq('id', userId);
  } catch (e) {
    console.log('Cancel subscription error:', e);
    throw e;
  }
}

export function getPlanPrice(plan: SubscriptionPlan): { amount: number; label: string } {
  switch (plan) {
    case 'verified_pro': return { amount: 900, label: '$9.00/month' };
    case 'business': return { amount: 4999, label: '$49.99/month' };
  }
}
