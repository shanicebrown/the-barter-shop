import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { supabase } from '../../config/supabase';
import { colors, spacing, fontSize, borderRadius, fonts } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

export default function WelcomeScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { userName } = route.params;
  const [displayName, setDisplayName] = useState(userName || '');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fetch real name from Supabase
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase.from('profiles')
            .select('full_name, username')
            .eq('id', user.id)
            .single();
          if (profile?.full_name) {
            setDisplayName(profile.full_name.split(' ')[0]);
          } else if (profile?.username) {
            setDisplayName(profile.username);
          } else if (user.email) {
            setDisplayName(user.email.split('@')[0]);
          }
        }
      } catch (e) {
        console.log('Name fetch error:', e);
      }
    })();

    // Fade in animation
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
  }, [fadeAnim]);

  async function handleContinue(goToProfile: boolean) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      Alert.alert(
        'Confirm your email',
        "We sent you a confirmation link. Tap it, then sign in to start trading.",
        [{ text: 'Go to Sign In', onPress: () => navigation.navigate('Login') }],
      );
      return;
    }
    try {
      await supabase.from('profiles').update({ onboarding_complete: true }).eq('id', session.user.id);
    } catch (e) {
      console.log('Onboarding complete error:', e);
    }
    // The auth state change from signup already happened.
    // Signing in again or refreshing session will trigger the
    // navigator to switch to the authenticated stack automatically.
    // Force a session refresh to trigger the auth state change:
    await supabase.auth.refreshSession();
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.spacerTop} />

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Image
          source={require('../../../assets/BarterLogo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.appName}>The Barter Shop</Text>

        <View style={styles.spacer24} />

        {displayName ? (
          <Text style={styles.welcomeText}>Welcome, {displayName}!</Text>
        ) : (
          <Text style={styles.welcomeText}>Welcome to The Barter Shop!</Text>
        )}

        <Text style={styles.subtitle}>
          Your account has been created.{'\n'}Start exploring services near you.
        </Text>
      </Animated.View>

      <View style={{ flex: 1 }} />

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom || 16 }]}>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => handleContinue(true)}>
          <Text style={styles.primaryBtnText}>Complete Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.outlineBtn} onPress={() => handleContinue(false)}>
          <Text style={styles.outlineBtnText}>Start Exploring</Text>
        </TouchableOpacity>

        <View style={styles.guaranteeCard}>
          <Text style={styles.guaranteeText}>
            🤝 Your 48-Hour Match Guarantee is now active.{'\n\n'}We will personally match you with your first barter partner within 48 hours. If we can't — your free trial automatically extends by 30 days. No questions asked.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  spacerTop: { height: '15%' },
  content: { alignItems: 'center', paddingHorizontal: 32 },
  logo: { width: 112, height: 112, marginBottom: 16 },
  appName: { fontSize: 24, fontWeight: '800', color: '#000', fontFamily: fonts.extraBold },
  spacer24: { height: 24 },
  welcomeText: { fontSize: 22, fontWeight: '700', color: colors.primary, fontFamily: fonts.bold, textAlign: 'center' },
  subtitle: { fontSize: fontSize.md, color: '#999', textAlign: 'center', lineHeight: 24, marginTop: 12, fontFamily: fonts.regular },
  bottomBar: { paddingHorizontal: 24, gap: 12 },
  primaryBtn: { backgroundColor: colors.primary, height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  primaryBtnText: { color: '#FFF', fontSize: fontSize.md, fontWeight: '700', fontFamily: fonts.bold },
  outlineBtn: { borderWidth: 1.5, borderColor: '#E0E0E0', height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  outlineBtnText: { color: '#000', fontSize: fontSize.md, fontWeight: '600', fontFamily: fonts.semiBold },
  guaranteeCard: { backgroundColor: 'rgba(0,188,212,0.1)', borderWidth: 1, borderColor: colors.primary, borderRadius: 12, padding: 16, marginTop: 16 },
  guaranteeText: { fontSize: 13, color: '#00838F', lineHeight: 20, fontFamily: fonts.regular },
});
