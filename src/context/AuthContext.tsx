import React, { createContext, useCallback, useContext } from 'react';
import { Alert } from 'react-native';

type AuthContextValue = {
  isGuest: boolean;
  /** Leaves guest mode, returning to onboarding/sign-up. */
  exitGuest: () => void;
};

const AuthContext = createContext<AuthContextValue>({ isGuest: false, exitGuest: () => {} });

export const AuthProvider = AuthContext.Provider;

export function useAuth() {
  return useContext(AuthContext);
}

/**
 * Returns a guard for actions that need a real account. When browsing as a
 * guest it explains why and offers sign-up, then returns false.
 */
export function useRequireAccount() {
  const { isGuest, exitGuest } = useAuth();
  return useCallback(
    (action: string) => {
      if (!isGuest) return true;
      Alert.alert(
        'Create a free account',
        `You need an account to ${action}. It's free and takes about a minute.`,
        [
          { text: 'Not now', style: 'cancel' },
          { text: 'Sign up', onPress: exitGuest },
        ],
      );
      return false;
    },
    [isGuest, exitGuest],
  );
}
