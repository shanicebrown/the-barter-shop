import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Linking, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { supabase } from '../../config/supabase';
import { deleteAccount, fetchMyProfile } from '../../services/AccountService';
import { spacing, fontSize, borderRadius } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const SUPPORT_EMAIL = 'info@thebartershop.app';
const CALENDLY = 'https://calendly.com/thebartershopapp/do-you-have-questions-let-s-chat-1-1';

export default function SettingsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [deleting, setDeleting] = useState(false);
  const [verifyTier, setVerifyTier] = useState<'verified_pro' | 'business'>('verified_pro');

  useEffect(() => {
    fetchMyProfile()
      .then((p) => { if (p?.user_type === 'business') setVerifyTier('business'); })
      .catch(() => {});
  }, []);

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) Alert.alert('Error', 'Unable to sign out. Please try again.');
    // App.tsx's auth listener swaps to the signed-out stack.
  }

  function confirmDelete() {
    Alert.alert(
      'Delete your account?',
      'This permanently deletes your profile, listings, messages, uploaded documents, and Barter Bucks (including any you purchased). Signed barter agreements are kept for the other party\'s records with your name removed. This cannot be undone.\n\nIf you have a paid subscription, cancel it in your App Store or Google Play settings first — deleting your account does not stop store billing.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete Account', style: 'destructive', onPress: runDelete },
      ],
    );
  }

  async function runDelete() {
    setDeleting(true);
    try {
      await deleteAccount();
    } catch (e: any) {
      console.log('Delete account error:', e?.message ?? e);
      Alert.alert(
        'Could not delete account',
        `Please try again, or email ${SUPPORT_EMAIL} and we'll delete it for you.`,
      );
    } finally {
      setDeleting(false);
    }
  }

  function getHelp() {
    Alert.alert('Help', 'How would you like to reach us?', [
      { text: 'Email support', onPress: () => Linking.openURL(`mailto:${SUPPORT_EMAIL}`) },
      { text: 'Book a 1:1 chat', onPress: () => Linking.openURL(CALENDLY) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12} accessibilityLabel="Back">
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.header}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}>
        <Section title="Account">
          <Row icon="star-outline" label="Membership" onPress={() => navigation.navigate('Subscription')} />
          <Row icon="person-outline" label="Edit Profile" onPress={() => navigation.navigate('ProfileCreation')} />
          <Row icon="shield-checkmark-outline" label="Get Verified" onPress={() => navigation.navigate('VerificationFlow', { tier: verifyTier })} />
          <Row icon="notifications-outline" label="Notifications" onPress={() => navigation.navigate('Notifications')} />
        </Section>

        <Section title="Tax & Finance">
          <Row icon="receipt-outline" label="Tax Documents" onPress={() => navigation.navigate('TaxDocuments')} />
          <Row icon="calculator-outline" label="Understanding Barter Taxes" onPress={() => navigation.navigate('TaxEducation')} />
        </Section>

        <Section title="Legal">
          <Row icon="document-text-outline" label="Terms of Use" onPress={() => navigation.navigate('TermsOfUse')} />
          <Row icon="lock-closed-outline" label="Privacy Policy" onPress={() => navigation.navigate('PrivacyPolicy')} />
          <Row icon="people-outline" label="Community Guidelines" onPress={() => navigation.navigate('CommunityGuidelines')} />
        </Section>

        <Section title="Support">
          <Row icon="help-circle-outline" label="Help & Contact" onPress={getHelp} />
        </Section>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton} onPress={confirmDelete} disabled={deleting}>
          {deleting ? <ActivityIndicator color="#999" /> : <Text style={styles.deleteText}>Delete Account</Text>}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Row({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} accessibilityRole="button">
      <Ionicons name={icon} size={20} color="#000" />
      <Text style={styles.rowText}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color="#999" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', paddingHorizontal: spacing.lg },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.md, marginBottom: spacing.sm },
  header: { fontSize: fontSize.lg, fontWeight: 'bold', color: '#000' },
  section: { marginBottom: spacing.lg },
  sectionTitle: { fontSize: fontSize.xs, fontWeight: '600', color: '#999', textTransform: 'uppercase', marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: spacing.md, borderRadius: borderRadius.md, marginBottom: spacing.xs, borderWidth: 1, borderColor: '#F0F0F0', gap: 12 },
  rowText: { flex: 1, color: '#000', fontSize: fontSize.md },
  logoutButton: { backgroundColor: '#FFF', padding: spacing.md, borderRadius: borderRadius.lg, alignItems: 'center', marginTop: spacing.sm, borderWidth: 1, borderColor: '#FF4444' },
  logoutText: { color: '#FF4444', fontSize: fontSize.md, fontWeight: '600' },
  deleteButton: { padding: spacing.md, alignItems: 'center', marginTop: spacing.sm },
  deleteText: { color: '#999', fontSize: fontSize.sm, textDecorationLine: 'underline' },
});
