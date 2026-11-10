import 'react-native-url-polyfill/auto';
import { Platform } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import * as Linking from 'expo-linking';

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

const WebStorageAdapter = {
  getItem: (key: string) => Promise.resolve(localStorage.getItem(key)),
  setItem: (key: string, value: string) => Promise.resolve(localStorage.setItem(key, value)),
  removeItem: (key: string) => Promise.resolve(localStorage.removeItem(key)),
};

const storageAdapter = Platform.OS === 'web' ? WebStorageAdapter : ExpoSecureStoreAdapter;

const SUPABASE_URL = 'https://idbiikbesfwceavainsa.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_GmAOEuFqRreDI6zmQZyKug_dyCluDGZ';

// Deep link redirect URL for auth callbacks
export const AUTH_REDIRECT_URL = Linking.createURL('auth/callback');

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: storageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
