import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { supabase } from '../../config/supabase';
import { colors, spacing, fontSize, borderRadius, fonts } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const SOCIAL_ICONS: { name: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { name: 'TikTok', icon: 'musical-notes' },
  { name: 'X', icon: 'logo-twitter' },
  { name: 'Facebook', icon: 'logo-facebook' },
  { name: 'Instagram', icon: 'logo-instagram' },
  { name: 'LinkedIn', icon: 'logo-linkedin' },
];

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert('Missing Fields', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) {
        console.log('Login error:', error.message);
        Alert.alert('Login Failed', 'Invalid email or password. Please try again.');
      }
    } catch (e) {
      console.log('Login exception:', e);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      {/* Logo */}
      <View style={styles.logoSection}>
        <Image source={require('../../../assets/BarterLogo.png')} style={styles.logo} resizeMode="contain" />
        <View style={styles.titleRow}>
          <Text style={styles.title}>The Barter Shop </Text>
          <Text style={styles.titleBeta}>Beta</Text>
        </View>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <View style={[styles.inputRow, emailFocused && styles.inputRowFocused]}>
          <Ionicons name="at" size={20} color={emailFocused ? colors.primary : '#999'} />
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
          />
        </View>

        <View style={[styles.inputRow, passwordFocused && styles.inputRowFocused]}>
          <Ionicons name="lock-closed-outline" size={20} color={passwordFocused ? colors.primary : '#999'} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#999" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.forgotRow} onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.forgotText}>Forget password?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.loginBtn, loading && { opacity: 0.6 }]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.loginBtnText}>{loading ? 'Logging in...' : 'Login'}</Text>
        </TouchableOpacity>

        {/* OR divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social logins */}
        <View style={styles.socialRow}>
          {SOCIAL_ICONS.map((s) => (
            <TouchableOpacity key={s.name} style={styles.socialBtn}>
              <Ionicons name={s.icon} size={22} color="#000" />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Registration')}>
          <Text style={styles.signupText}>
            Don't have an account? <Text style={styles.signupLink}>Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', paddingHorizontal: 24, justifyContent: 'center' },
  logoSection: { alignItems: 'center', marginBottom: 40 },
  logo: { width: 64, height: 64, marginBottom: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'baseline' },
  title: { fontSize: 24, fontWeight: '700', color: '#000', fontFamily: fonts.extraBold },
  titleBeta: { fontSize: 24, fontWeight: '700', color: colors.primary, fontFamily: fonts.extraBold },
  form: { gap: 16 },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1.5, borderBottomColor: '#E0E0E0', paddingBottom: 10, gap: 10 },
  inputRowFocused: { borderBottomColor: colors.primary },
  input: { flex: 1, fontSize: fontSize.md, color: '#000', paddingVertical: 4, fontFamily: fonts.regular },
  forgotRow: { alignSelf: 'flex-end' },
  forgotText: { fontSize: fontSize.sm, fontWeight: '700', color: '#000', fontFamily: fonts.bold },
  loginBtn: { backgroundColor: colors.primary, height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  loginBtnText: { color: '#FFF', fontSize: fontSize.md, fontWeight: '700', fontFamily: fonts.bold },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 4 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E0E0E0' },
  dividerText: { fontSize: fontSize.xs, color: '#999', fontWeight: '600', fontFamily: fonts.semiBold },
  socialRow: { flexDirection: 'row', justifyContent: 'center', gap: 12 },
  socialBtn: { width: 52, height: 52, borderRadius: 12, borderWidth: 1, borderColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' },
  signupText: { fontSize: fontSize.sm, color: '#999', textAlign: 'center', marginTop: 8, fontFamily: fonts.regular },
  signupLink: { color: colors.primary, fontWeight: '700', fontFamily: fonts.bold },
});
