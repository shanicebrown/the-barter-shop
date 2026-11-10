import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import * as Linking from 'expo-linking';
import { supabase } from '../../config/supabase';
import { colors, spacing, fontSize, fonts } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'EmailConfirmed'>;

export default function EmailConfirmedScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const scaleAnim = useRef(new Animated.Value(0)).current;

  const url = Linking.useURL();

  useEffect(() => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 7 }).start();
  }, [scaleAnim]);

  useEffect(() => {
    if (url) signInFromLink(url);
  }, [url]);

  async function signInFromLink(link: string) {
    try {
      // Implicit flow puts tokens in the fragment; PKCE flow sends ?code=
      const fragment = link.includes('#') ? link.split('#')[1] : '';
      const hashParams = new URLSearchParams(fragment);
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      if (accessToken && refreshToken) {
        await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
        return;
      }
      const code = Linking.parse(link).queryParams?.code;
      if (typeof code === 'string') {
        await supabase.auth.exchangeCodeForSession(code);
      }
    } catch (e) {
      console.log('Email link sign-in error:', e);
    }
  }

  async function handleContinue() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) navigation.navigate('Login');
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <Animated.View style={[styles.checkCircle, { transform: [{ scale: scaleAnim }] }]}>
          <Ionicons name="checkmark" size={48} color="#FFF" />
        </Animated.View>

        <Text style={styles.title}>Email Confirmed!</Text>
        <Text style={styles.subtitle}>
          Welcome to The Barter Shop.{'\n'}Your account is now active.
        </Text>
      </View>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom || 16 }]}>
        <TouchableOpacity style={styles.primaryBtn} onPress={handleContinue}>
          <Text style={styles.primaryBtnText}>Start Exploring</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32, gap: 16 },
  checkCircle: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: '#000', fontFamily: fonts.extraBold },
  subtitle: { fontSize: fontSize.md, color: '#999', textAlign: 'center', lineHeight: 24, fontFamily: fonts.regular },
  bottomBar: { paddingHorizontal: 24 },
  primaryBtn: { backgroundColor: colors.primary, height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  primaryBtnText: { color: '#FFF', fontSize: fontSize.md, fontWeight: '700', fontFamily: fonts.bold },
});
