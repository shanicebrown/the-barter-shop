import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import {
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Nunito_900Black,
} from '@expo-google-fonts/nunito';
import { Session } from '@supabase/supabase-js';
import { supabase } from './src/config/supabase';
import { navigationTheme, fonts } from './src/theme';
import RootNavigator from './src/navigation/RootNavigator';
import { ListingsProvider } from './src/context/ListingsContext';
import { BarterBucksProvider } from './src/context/BarterBucksContext';
import { NotificationsProvider } from './src/context/NotificationsContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { getUserLocation, updateUserLocation } from './src/services/LocationService';
import { syncPendingProfile } from './src/services/PendingProfile';
import { AuthProvider } from './src/context/AuthContext';
import { EntitlementProvider } from './src/context/EntitlementContext';
import { configurePurchases, identifyPurchaser } from './src/services/Purchases';
import { StripeProvider } from '@stripe/stripe-react-native';
import BBToast from './src/components/BBToast';
import BBIntroTooltip from './src/components/BBIntroTooltip';

import * as Linking from 'expo-linking';

// Use a pk_test_ key in .env while testing; the live key is the production fallback.
const STRIPE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_live_51On9miFWVzjrZiKXHZIUPNHiFE1qp73LyfhWIvc93ksw3aVc6vHlVvmjh0rHc1GwcKv7njIRzbWFm0Am0zQBgqR400GxBdrjWZ';

const linking = {
  prefixes: [
    Linking.createURL('/'),
    'thebartershop://',
    'https://www.thebartershop.app',
  ],
  config: {
    screens: {
      EmailConfirmed: 'auth/callback',
      Subscription: 'subscription',
    },
  },
};

SplashScreen.preventAutoHideAsync();

function LoadingScreen() {
  return (
    <View style={splashStyles.container}>
      <Image
        source={require('./assets/BarterLogo.png')}
        style={splashStyles.logo}
        resizeMode="contain"
      />
      <Text style={splashStyles.title}>The Barter Shop</Text>
      <Text style={splashStyles.tagline}>Trade Your Skills. Preserve Your Cash.</Text>
      <ActivityIndicator size="small" color="#00BCD4" style={splashStyles.loader} />
    </View>
  );
}

const splashStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center' },
  logo: { width: 80, height: 80, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '800', color: '#FFF', marginBottom: 8 },
  tagline: { fontSize: 16, fontWeight: '600', color: '#00BCD4' },
  loader: { position: 'absolute', bottom: 80 },
});

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [guestMode, setGuestMode] = useState(false);
  const [startAtSignup, setStartAtSignup] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Nunito_900Black,
  });

  const userId = session?.user.id ?? null;

  useEffect(() => {
    configurePurchases();
  }, []);

  useEffect(() => {
    identifyPurchaser(userId);
  }, [userId]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
      if (session?.user) {
        updateLocationForUser(session.user.id);
        syncPendingProfile(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event === 'SIGNED_OUT') {
        setGuestMode(false);
      }
      if (event === 'SIGNED_IN' && session?.user) {
        updateLocationForUser(session.user.id);
        syncPendingProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function updateLocationForUser(userId: string) {
    try {
      const loc = await getUserLocation();
      if (loc) {
        await updateUserLocation(userId, loc.coords, loc.city, loc.state);
      }
    } catch (e) {
      console.log('Location update on auth:', e);
    }
  }

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded && !authLoading) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, authLoading]);

  if (!fontsLoaded || authLoading) {
    return <LoadingScreen />;
  }

  const isAuth = !!session || guestMode;
  const authValue = {
    isGuest: !session && guestMode,
    exitGuest: () => {
      setStartAtSignup(true);
      setGuestMode(false);
    },
  };

  return (
    <AuthProvider value={authValue}>
    <StripeProvider publishableKey={STRIPE_KEY} merchantIdentifier="merchant.com.thebartershop.app">
      <SafeAreaProvider onLayout={onLayoutRootView}>
        <EntitlementProvider userId={userId}>
        <BarterBucksProvider userId={userId}>
          <NotificationsProvider>
            <ListingsProvider>
              <NavigationContainer theme={navigationTheme} linking={linking}>
                <StatusBar style="dark" />
                <RootNavigator
                  isAuthenticated={isAuth}
                  startAtSignup={startAtSignup}
                  onSkipAuth={() => {
                    setStartAtSignup(false);
                    setGuestMode(true);
                  }}
                />
                {isAuth && <BBToast />}
                {isAuth && <BBIntroTooltip />}
              </NavigationContainer>
            </ListingsProvider>
          </NotificationsProvider>
        </BarterBucksProvider>
        </EntitlementProvider>
      </SafeAreaProvider>
    </StripeProvider>
    </AuthProvider>
  );
}
