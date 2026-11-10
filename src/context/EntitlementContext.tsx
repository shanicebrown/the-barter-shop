import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from '../config/supabase';

export type Tier = 'freemium' | 'verified_pro' | 'business';

export type Entitlement = {
  tier: Tier;
  /** founding | app_store | play_store | promotional | free */
  source: string;
  expiresAt: string | null;
  isFoundingMember: boolean;
};

const FREE: Entitlement = { tier: 'freemium', source: 'free', expiresAt: null, isFoundingMember: false };

type Value = Entitlement & { loading: boolean; refresh: () => Promise<void> };

const EntitlementContext = createContext<Value>({ ...FREE, loading: false, refresh: async () => {} });

/**
 * The member's current tier as computed by the server (`my_entitlement`):
 * founding membership and store subscriptions combined, highest tier wins.
 */
export function EntitlementProvider({ userId, children }: { userId: string | null; children: React.ReactNode }) {
  const [ent, setEnt] = useState<Entitlement>(FREE);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!userId) {
      setEnt(FREE);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.rpc('my_entitlement');
    setLoading(false);
    if (error) {
      console.log('Entitlement load error:', error.message);
      return;
    }
    const row = Array.isArray(data) ? data[0] : data;
    setEnt(row ? {
      tier: row.tier,
      source: row.source,
      expiresAt: row.expires_at,
      isFoundingMember: !!row.is_founding_member,
    } : FREE);
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return <EntitlementContext.Provider value={{ ...ent, loading, refresh }}>{children}</EntitlementContext.Provider>;
}

export function useEntitlement() {
  return useContext(EntitlementContext);
}

export const TIER_LABEL: Record<Tier, string> = {
  freemium: 'Community',
  verified_pro: 'Verified Pro',
  business: 'Business',
};
