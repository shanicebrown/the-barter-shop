import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { Animated } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { supabase } from '../config/supabase';

const INTRO_KEY = 'bb_intro_seen';

export type BBTransaction = {
  id: string;
  icon: string;
  description: string;
  date: string;
  amount: number;
};

export type TierInfo = {
  name: string;
  icon: string;
  minBB: number;
  maxBB: number;
};

export const TIERS: TierInfo[] = [
  { name: 'Seedling', icon: '🌱', minBB: 0, maxBB: 9 },
  { name: 'Trader', icon: '🔄', minBB: 10, maxBB: 24 },
  { name: 'Pro', icon: '⭐', minBB: 25, maxBB: 49 },
  { name: 'Expert', icon: '💎', minBB: 50, maxBB: 99 },
  { name: 'Legend', icon: '👑', minBB: 100, maxBB: Infinity },
];

export type Perk = 'boost_listing' | 'featured_barterer' | 'premium_analytics' | 'tier_promotion';

/** Barter Bucks packs sold for trade use (prices are enforced server-side in `bb-checkout`). */
export type PackId = 'bb_5' | 'bb_20' | 'bb_50';
export const PACKS: { id: PackId; bb: number; price: string; note?: string }[] = [
  { id: 'bb_5', bb: 5, price: '$5.00' },
  { id: 'bb_20', bb: 20, price: '$10.00', note: 'Save 50%' },
  { id: 'bb_50', bb: 50, price: '$19.99', note: 'Best value' },
];

type BarterBucksContextType = {
  /** Total of both kinds — what members see as "my Barter Bucks". */
  balance: number;
  /** Earned through activity; usable for perks and trades. */
  earnedBalance: number;
  /** Bought with USD; usable only to cover a value difference in a barter. */
  purchasedBalance: number;
  transactions: BBTransaction[];
  loading: boolean;
  currentTier: TierInfo;
  currentTierIndex: number;
  bbToNextTier: number;
  hasSeenIntro: boolean;
  showToast: boolean;
  toastAmount: number;
  pulseAnim: Animated.Value;
  /** Spends Barter Bucks on a perk. Throws with a readable message on failure. */
  redeemPerk: (perk: Perk) => Promise<void>;
  refresh: () => Promise<void>;
  dismissIntro: () => void;
  dismissToast: () => void;
};

const BarterBucksContext = createContext<BarterBucksContextType>({} as BarterBucksContextType);

export function useBarterBucks() {
  return useContext(BarterBucksContext);
}

function getTier(balance: number) {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (balance >= TIERS[i].minBB) return { tier: TIERS[i], index: i };
  }
  return { tier: TIERS[0], index: 0 };
}

const ICONS: Record<string, string> = {
  barter_completed: '🤝',
  five_star_review: '⭐',
  verified: '✅',
  profile_complete: '🆕',
  welcome_bonus: '🎉',
  gap_settlement: '🔄',
  penalty: '⚠️',
};

type Row = { id: string; amount: number; reason: string; label: string; created_at: string };

function relativeDate(iso: string) {
  const days = Math.floor((Date.now() - Date.parse(iso)) / 86_400_000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} wk ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function toTransaction(r: Row): BBTransaction {
  return {
    id: r.id,
    icon: ICONS[r.reason] ?? (r.reason.startsWith('perk:') ? '🚀' : r.reason === 'purchase' ? '💳' : '💰'),
    description: r.label,
    date: relativeDate(r.created_at),
    amount: r.amount,
  };
}

/**
 * The member's Barter Bucks wallet, read from the server ledger
 * (`bb_transactions`). Balances only change server-side: awards come from
 * database triggers, spending goes through `bb_redeem_perk`.
 */
export function BarterBucksProvider({ userId, children }: { userId: string | null; children: React.ReactNode }) {
  const [earnedBalance, setEarnedBalance] = useState(0);
  const [purchasedBalance, setPurchasedBalance] = useState(0);
  const balance = earnedBalance + purchasedBalance;
  const [transactions, setTransactions] = useState<BBTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSeenIntro, setHasSeenIntro] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastAmount, setToastAmount] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Reputation tiers reflect earned Barter Bucks only, so tiers can't be bought.
  const { tier: currentTier, index: currentTierIndex } = getTier(earnedBalance);
  const nextTier = TIERS[Math.min(currentTierIndex + 1, TIERS.length - 1)];
  const bbToNextTier = currentTierIndex < TIERS.length - 1 ? nextTier.minBB - earnedBalance : 0;

  const refresh = useCallback(async () => {
    if (!userId) {
      setEarnedBalance(0);
      setPurchasedBalance(0);
      setTransactions([]);
      return;
    }
    setLoading(true);
    const [profileRes, txRes] = await Promise.all([
      supabase.from('profiles').select('barter_bucks, barter_bucks_purchased').eq('id', userId).single(),
      supabase.from('bb_transactions')
        .select('id, amount, reason, label, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50),
    ]);
    setLoading(false);
    if (profileRes.error) console.log('BB balance error:', profileRes.error.message);
    else {
      setEarnedBalance(profileRes.data?.barter_bucks ?? 0);
      setPurchasedBalance(profileRes.data?.barter_bucks_purchased ?? 0);
    }
    if (txRes.error) console.log('BB history error:', txRes.error.message);
    else setTransactions((txRes.data as Row[]).map(toTransaction));
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Live updates: awards are posted by server triggers (barter completed,
  // review received, verification approved), so listen for new ledger rows.
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`bb:${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'bb_transactions', filter: `user_id=eq.${userId}` },
        (payload) => {
          const row = payload.new as Row & { bucket: 'earned' | 'purchased' };
          if (row.bucket === 'purchased') setPurchasedBalance((b) => b + row.amount);
          else setEarnedBalance((b) => b + row.amount);
          setTransactions((prev) => [toTransaction(row), ...prev.filter((t) => t.id !== row.id)]);
          if (row.amount > 0) {
            setToastAmount(row.amount);
            setShowToast(true);
            Animated.sequence([
              Animated.timing(pulseAnim, { toValue: 1.3, duration: 150, useNativeDriver: true }),
              Animated.timing(pulseAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
            ]).start();
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, pulseAnim]);

  const redeemPerk = useCallback(async (perk: Perk) => {
    if (!userId) throw new Error('Create an account to use Barter Bucks.');
    const { error } = await supabase.rpc('bb_redeem_perk', { p_perk: perk });
    if (error) {
      if (error.message.includes('only be used in trades')) {
        throw new Error('Perks use earned Barter Bucks. Purchased Barter Bucks can only cover a value difference in a barter.');
      }
      throw new Error(error.message.includes('Not enough') ? "You don't have enough Barter Bucks for that yet." : 'Something went wrong. Please try again.');
    }
    await refresh();
  }, [userId, refresh]);

  useEffect(() => {
    SecureStore.getItemAsync(INTRO_KEY)
      .then((v) => { if (v === '1') setHasSeenIntro(true); })
      .catch(() => {});
  }, []);

  const dismissIntro = useCallback(() => {
    setHasSeenIntro(true);
    SecureStore.setItemAsync(INTRO_KEY, '1').catch(() => {});
  }, []);
  const dismissToast = useCallback(() => setShowToast(false), []);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  return (
    <BarterBucksContext.Provider
      value={{
        balance, earnedBalance, purchasedBalance, transactions, loading, currentTier, currentTierIndex, bbToNextTier,
        hasSeenIntro, showToast, toastAmount, pulseAnim,
        redeemPerk, refresh, dismissIntro, dismissToast,
      }}
    >
      {children}
    </BarterBucksContext.Provider>
  );
}
