import { Platform } from 'react-native';
import Purchases, { PurchasesPackage, PURCHASES_ERROR_CODE } from 'react-native-purchases';
import { supabase } from '../config/supabase';

/**
 * In-app subscriptions (Apple App Store / Google Play) via RevenueCat.
 *
 * RevenueCat setup this code expects:
 *  - Entitlements: `verified_pro`, `business`
 *  - Products (same IDs in App Store Connect and Play Console):
 *      thebartershop.verified_pro.monthly  ($9.00/mo, 30-day free trial) → verified_pro
 *      thebartershop.business.monthly      ($49.99/mo, 30-day free trial) → business
 *  - Current offering with packages `verified_pro_monthly` and `business_monthly`
 *  - Webhook → Supabase Edge Function `sync-subscription`
 */
export type PaidTier = 'verified_pro' | 'business';

const API_KEY = Platform.select({
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY,
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY,
});

let configured = false;

export function purchasesAvailable() {
  return configured;
}

export function configurePurchases() {
  if (configured || !API_KEY || Platform.OS === 'web') return;
  try {
    Purchases.configure({ apiKey: API_KEY });
    configured = true;
  } catch (e) {
    console.log('RevenueCat configure failed:', e);
  }
}

/** Ties purchases to the Supabase user so receipts follow the account across devices. */
export async function identifyPurchaser(userId: string | null) {
  if (!configured) return;
  try {
    if (userId) await Purchases.logIn(userId);
    else if (!(await Purchases.getCustomerInfo()).originalAppUserId.startsWith('$RCAnonymousID')) {
      await Purchases.logOut();
    }
  } catch (e) {
    console.log('RevenueCat identify failed:', e);
  }
}

function tierForPackage(pkg: PurchasesPackage): PaidTier | null {
  const id = `${pkg.identifier} ${pkg.product.identifier}`.toLowerCase();
  if (id.includes('business')) return 'business';
  if (id.includes('verified_pro')) return 'verified_pro';
  return null;
}

export type StorePlan = {
  tier: PaidTier;
  pkg: PurchasesPackage;
  priceString: string;
  hasFreeTrial: boolean;
};

/** Store-localized plans, or an empty object when the store isn't reachable. */
export async function loadPlans(): Promise<Partial<Record<PaidTier, StorePlan>>> {
  if (!configured) return {};
  const offerings = await Purchases.getOfferings();
  const plans: Partial<Record<PaidTier, StorePlan>> = {};
  for (const pkg of offerings.current?.availablePackages ?? []) {
    const tier = tierForPackage(pkg);
    if (tier && !plans[tier]) {
      plans[tier] = {
        tier,
        pkg,
        priceString: pkg.product.priceString,
        hasFreeTrial: pkg.product.introPrice?.price === 0,
      };
    }
  }
  return plans;
}

export type PurchaseOutcome = 'purchased' | 'cancelled';

export async function buyPlan(plan: StorePlan): Promise<PurchaseOutcome> {
  try {
    await Purchases.purchasePackage(plan.pkg);
  } catch (e: any) {
    if (e?.userCancelled || e?.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) return 'cancelled';
    throw e;
  }
  await syncSubscription();
  return 'purchased';
}

/** Required by App Store Review: lets members recover purchases on a new device. */
export async function restorePurchases(): Promise<boolean> {
  if (!configured) return false;
  const info = await Purchases.restorePurchases();
  await syncSubscription();
  return Object.keys(info.entitlements.active).length > 0;
}

export async function openManageSubscriptions() {
  if (configured) await Purchases.showManageSubscriptions();
}

/**
 * Asks the server to re-read the member's subscription from RevenueCat.
 * The webhook does the same thing; this just makes the new tier show up
 * immediately after a purchase instead of waiting for the webhook.
 */
export async function syncSubscription() {
  const { error } = await supabase.functions.invoke('sync-subscription', { body: {} });
  if (error) console.log('Subscription sync error:', error.message);
}
