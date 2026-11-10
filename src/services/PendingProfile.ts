import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { supabase } from '../config/supabase';
import { AccountType } from '../types/navigation';

/**
 * Sign-up requires email confirmation, so there is no session while the
 * user fills in the registration screens and row-level security rejects
 * profile writes. Details are held on-device and written to `profiles`
 * on the first authenticated session.
 */
export type PendingProfile = {
  username?: string;
  user_type?: AccountType;
  skills_offered?: string[];
  skills_wanted?: string[];
  bio?: string;
  business_address?: string;
  website?: string;
  years_in_business?: number;
  intended_plan?: 'verified_pro' | 'business';
};

const KEY = 'pending_profile';

async function read(): Promise<PendingProfile> {
  try {
    const raw = Platform.OS === 'web'
      ? localStorage.getItem(KEY)
      : await SecureStore.getItemAsync(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

async function write(value: PendingProfile | null): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      if (value) localStorage.setItem(KEY, JSON.stringify(value));
      else localStorage.removeItem(KEY);
    } else if (value) {
      await SecureStore.setItemAsync(KEY, JSON.stringify(value));
    } else {
      await SecureStore.deleteItemAsync(KEY);
    }
  } catch (e) {
    console.log('Pending profile storage error:', e);
  }
}

export async function savePendingProfile(patch: PendingProfile): Promise<void> {
  const current = await read();
  await write({ ...current, ...patch });
}

/** Writes any held registration details to the user's profile row. */
export async function syncPendingProfile(userId: string): Promise<void> {
  const pending = await read();
  if (!Object.keys(pending).length) return;

  const update: Record<string, unknown> = {};
  if (pending.username) {
    update.username = pending.username;
    update.full_name = pending.username;
  }
  // user_type is set server-side from sign-up metadata (handle_new_user).
  if (pending.skills_offered?.length) update.skills_offered = pending.skills_offered;
  if (pending.skills_wanted?.length) update.skills_wanted = pending.skills_wanted;
  if (pending.bio) update.bio = pending.bio;
  if (pending.business_address) update.business_address = pending.business_address;
  if (pending.website) update.website = pending.website;
  if (pending.years_in_business) update.years_in_business = pending.years_in_business;

  if (Object.keys(update).length) {
    const { error } = await supabase.from('profiles').update(update).eq('id', userId);
    if (error) {
      // Keep the pending data so the next sign-in retries.
      console.log('Pending profile sync error:', error.message);
      return;
    }
  }
  // The chosen plan is consumed separately by the home screen.
  await write(pending.intended_plan ? { intended_plan: pending.intended_plan } : null);
}

/** Paid plan chosen during sign-up, offered once after the first sign-in. */
export async function takeIntendedPlan(): Promise<'verified_pro' | 'business' | null> {
  const pending = await read();
  if (!pending.intended_plan) return null;
  const { intended_plan, ...rest } = pending;
  await write(Object.keys(rest).length ? rest : null);
  return intended_plan;
}
