import React, { useState } from 'react';
import { View, Text, TextInput, Image, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, ActionSheetIOS, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { RootStackParamList } from '../../types/navigation';
import { supabase, AUTH_REDIRECT_URL } from '../../config/supabase';
import { colors, spacing, fontSize, borderRadius, fonts } from '../../theme';
import { savePendingProfile, syncPendingProfile } from '../../services/PendingProfile';

type Props = NativeStackScreenProps<RootStackParamList, 'RegistrationInfo'>;

export default function RegistrationInfoScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { accountType } = route.params;
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');
  const [years, setYears] = useState('');
  const [aboutBiz, setAboutBiz] = useState('');
  const [aboutPro, setAboutPro] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);

  const [loading, setLoading] = useState(false);

  const isBusiness = accountType === 'business';
  const isPro = accountType === 'verified_pro';

  async function handlePickImage() {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ['Cancel', 'Take Photo', 'Choose from Library'], cancelButtonIndex: 0 },
        (idx) => { if (idx === 1) takePhoto(); else if (idx === 2) pickFromLibrary(); },
      );
    } else {
      Alert.alert('Profile Photo', 'Choose an option', [
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Library', onPress: pickFromLibrary },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  }

  async function pickFromLibrary() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission needed', 'Please allow access to your photo library.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8, allowsMultipleSelection: false });
    if (!result.canceled) setProfileImage(result.assets[0].uri);
  }

  async function takePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission needed', 'Camera access is required.'); return; }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!result.canceled) setProfileImage(result.assets[0].uri);
  }
  const canContinue = username && email && password && confirmPassword && agreedToTerms && !loading;

  const photoLabel = isBusiness ? 'Business Icon' : 'Profile Photo';

  async function handleSignUp() {
    if (!username.trim() || !email.trim() || !password || !confirmPassword) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: username.trim(), username: username.trim(), user_type: accountType },
          emailRedirectTo: AUTH_REDIRECT_URL,
        },
      });

      if (error) {
        console.log('Signup error:', error.message);
        if (error.message.includes('already registered') || error.message.includes('already been registered')) {
          Alert.alert('Email Taken', 'This email is already registered. Please sign in instead.');
        } else {
          Alert.alert('Signup Failed', error.message);
        }
        return;
      }

      await savePendingProfile({
        username: username.trim(),
        user_type: accountType,
        bio: (isBusiness ? aboutBiz : isPro ? aboutPro : '').trim() || undefined,
        business_address: isBusiness ? address.trim() || undefined : undefined,
        website: isBusiness ? website.trim() || undefined : undefined,
        years_in_business: isBusiness && years.trim() ? parseInt(years, 10) || undefined : undefined,
      });
      // Only present when email confirmation is turned off in Supabase.
      if (data.session?.user) {
        await syncPendingProfile(data.session.user.id);
      }

      navigation.navigate('RegistrationSkills', { accountType });
    } catch (e) {
      console.log('Signup exception:', e);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Progress dots */}
      <View style={styles.progressRow}>
        {[1, 2, 3].map((s) => (
          <View key={s} style={[styles.progressDot, s === 2 && styles.progressDotActive]} />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Photo upload */}
        <View style={styles.photoSection}>
          <TouchableOpacity style={styles.photoBox} onPress={handlePickImage}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.photoImage} />
            ) : (
              <Ionicons name="camera" size={28} color="#999" />
            )}
            {imageUploading && (
              <View style={styles.photoOverlay}>
                <ActivityIndicator color="#FFF" />
              </View>
            )}
            {profileImage && !imageUploading && (
              <View style={styles.photoCheckmark}>
                <Ionicons name="checkmark" size={12} color="#FFF" />
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.photoLabel}>{photoLabel}</Text>
          <Text style={styles.photoHint}>Tap to {profileImage ? 'change' : 'add'} photo</Text>
        </View>

        {/* Shared fields */}
        <View style={styles.fields}>
          <FieldRow icon="person-outline" placeholder="Username" value={username} onChangeText={setUsername} />
          <FieldRow icon="at" placeholder="Email Address" value={email} onChangeText={setEmail} keyboardType="email-address" />
          <FieldRow icon="lock-closed-outline" placeholder="Password" value={password} onChangeText={setPassword} secure={!showPw} rightIcon={showPw ? 'eye-off-outline' : 'eye-outline'} onRightPress={() => setShowPw(!showPw)} />
          <FieldRow icon="lock-closed-outline" placeholder="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} secure={!showCpw} rightIcon={showCpw ? 'eye-off-outline' : 'eye-outline'} onRightPress={() => setShowCpw(!showCpw)} />
        </View>

        {/* Business extra fields */}
        {isBusiness && (
          <View style={styles.extraSection}>
            <Text style={styles.extraTitle}>Tell us about your business</Text>
            <FieldRow icon="location-outline" placeholder="Address" value={address} onChangeText={setAddress} />
            <FieldRow icon="globe-outline" placeholder="Website" value={website} onChangeText={setWebsite} />
            <FieldRow icon="business-outline" placeholder="Years in Business" value={years} onChangeText={setYears} keyboardType="numeric" />
            <TextInput style={styles.textarea} placeholder="Tell us about your business" placeholderTextColor="#999" value={aboutBiz} onChangeText={setAboutBiz} multiline numberOfLines={4} />
            <VerifyLaterNote docs="government ID, business license, and proof of insurance" />
          </View>
        )}

        {/* Verified Pro extra fields */}
        {isPro && (
          <View style={styles.extraSection}>
            <Text style={styles.extraTitle}>Tell us about yourself</Text>
            <TextInput style={styles.textarea} placeholder="Describe the service you offer" placeholderTextColor="#999" value={aboutPro} onChangeText={setAboutPro} multiline numberOfLines={4} />
            <VerifyLaterNote docs="government ID and a skill credential" />
          </View>
        )}

        {/* Terms */}
        <TouchableOpacity style={styles.checkboxRow} onPress={() => setAgreedToTerms(!agreedToTerms)} activeOpacity={0.7}>
          <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
            {agreedToTerms && <Ionicons name="checkmark" size={14} color="#FFF" />}
          </View>
          <Text style={styles.checkboxText}>
            By signing up, you agree to our{' '}
            <Text style={styles.legalLink} onPress={() => navigation.navigate('TermsOfUse')}>Terms & Conditions</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom || 16 }]}>
        <TouchableOpacity
          style={[styles.continueBtn, !canContinue && { opacity: 0.4 }]}
          onPress={handleSignUp}
          disabled={!canContinue}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.continueBtnText}>Sign Up</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

function VerifyLaterNote({ docs }: { docs: string }) {
  return (
    <View style={styles.verifyNote}>
      <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />
      <Text style={styles.verifyNoteText}>
        After you confirm your email, you'll upload your {docs} securely from Profile → Settings → Get Verified.
      </Text>
    </View>
  );
}

function FieldRow({ icon, placeholder, value, onChangeText, secure, rightIcon, onRightPress, keyboardType }: {
  icon: keyof typeof Ionicons.glyphMap; placeholder: string; value: string; onChangeText: (t: string) => void;
  secure?: boolean; rightIcon?: keyof typeof Ionicons.glyphMap; onRightPress?: () => void; keyboardType?: any;
}) {
  return (
    <View style={styles.fieldRow}>
      <Ionicons name={icon} size={20} color="#999" />
      <TextInput style={styles.fieldInput} placeholder={placeholder} placeholderTextColor="#999" value={value} onChangeText={onChangeText} secureTextEntry={secure} autoCapitalize="none" keyboardType={keyboardType} />
      {rightIcon && <TouchableOpacity onPress={onRightPress}><Ionicons name={rightIcon} size={20} color="#999" /></TouchableOpacity>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  progressRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingVertical: 12 },
  progressDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E0E0E0' },
  progressDotActive: { backgroundColor: colors.primary, width: 24 },
  content: { padding: 24, paddingBottom: 100 },
  photoSection: { alignItems: 'center', marginBottom: 24, gap: 8 },
  photoBox: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#E0E0E0', overflow: 'hidden' },
  photoImage: { width: 80, height: 80, borderRadius: 40 },
  photoOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', borderRadius: 40 },
  photoCheckmark: { position: 'absolute', bottom: 0, right: 0, width: 22, height: 22, borderRadius: 11, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF' },
  photoLabel: { fontSize: fontSize.sm, color: '#999', fontFamily: fonts.regular },
  photoHint: { fontSize: 11, color: colors.primary, fontFamily: fonts.semiBold },
  fields: { gap: 16 },
  fieldRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1.5, borderBottomColor: '#E0E0E0', paddingBottom: 10, gap: 10 },
  fieldInput: { flex: 1, fontSize: fontSize.md, color: '#000', paddingVertical: 4 },
  extraSection: { marginTop: 24, gap: 16 },
  extraTitle: { fontSize: fontSize.md, fontWeight: '700', color: '#000' },
  verifyNote: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start', backgroundColor: '#E6FAFA', borderRadius: borderRadius.lg, padding: spacing.md },
  verifyNoteText: { flex: 1, fontSize: fontSize.sm, color: '#333', lineHeight: 20 },
  textarea: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 12, padding: 16, fontSize: fontSize.sm, color: '#000', minHeight: 100, textAlignVertical: 'top' },
  uploadRow: { flexDirection: 'row', gap: 12 },
  uploadBtn: { width: 60, height: 60, borderRadius: 12, backgroundColor: '#FFD700', justifyContent: 'center', alignItems: 'center', gap: 2 },
  uploadBtnText: { fontSize: 8, color: '#000', fontWeight: '600' },
  checkboxRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 24, paddingVertical: 4 },
  checkbox: { width: 22, height: 22, borderRadius: 4, borderWidth: 2, borderColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center', marginTop: 1 },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkboxText: { flex: 1, fontSize: fontSize.sm, color: '#666', lineHeight: 20 },
  legalLink: { color: colors.primary, fontWeight: '600' },
  bottomBar: { paddingHorizontal: 24, paddingTop: 12, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  continueBtn: { backgroundColor: colors.primary, height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  continueBtnText: { color: '#FFF', fontSize: fontSize.md, fontWeight: '700' },
});
