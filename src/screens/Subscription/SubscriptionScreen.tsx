import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Linking, Alert, ActivityIndicator, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { colors, spacing, fontSize, borderRadius, fonts } from '../../theme';
import { supabase } from '../../config/supabase';
import { GuaranteePills } from '../../components/GuaranteeModal';
import { useEntitlement, Tier, TIER_LABEL } from '../../context/EntitlementContext';
import { savePendingProfile } from '../../services/PendingProfile';
import {
  PaidTier, StorePlan, loadPlans, buyPlan, restorePurchases, openManageSubscriptions, purchasesAvailable,
} from '../../services/Purchases';

type Props = NativeStackScreenProps<RootStackParamList, 'Subscription'>;

const LIST_PRICE: Record<PaidTier, string> = { verified_pro: '$9.00', business: '$49.99' };
const STORE_NAME = Platform.OS === 'ios' ? 'App Store' : 'Google Play';

function Feature({ included, text }: { included: boolean; text: string }) {
  return (
    <View style={styles.featureRow}>
      <Ionicons name={included ? 'checkmark-circle' : 'close-circle'} size={16} color={included ? colors.primary : '#CCC'} />
      <Text style={[styles.featureText, !included && { color: '#CCC' }]}>{text}</Text>
    </View>
  );
}

function formatDate(iso: string | null) {
  return iso ? new Date(iso).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : '';
}

export default function SubscriptionScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const ent = useEntitlement();
  const [isMember, setIsMember] = useState(false);
  const [selected, setSelected] = useState<Tier>(route.params?.highlight ?? 'freemium');
  const [plans, setPlans] = useState<Partial<Record<PaidTier, StorePlan>>>({});
  const [busy, setBusy] = useState<'buy' | 'restore' | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setIsMember(!!data.session));
    loadPlans().then(setPlans).catch((e) => console.log('Load plans error:', e?.message ?? e));
  }, []);

  useEffect(() => {
    if (isMember && !route.params?.highlight && ent.tier !== 'freemium') setSelected(ent.tier);
  }, [isMember, ent.tier, route.params?.highlight]);

  const priceFor = (t: PaidTier) => plans[t]?.priceString ?? LIST_PRICE[t];
  const trialFor = (t: PaidTier) => (plans[t] ? plans[t]!.hasFreeTrial : true);
  const isCurrent = (t: Tier) => isMember && ent.tier === t;
  const foundingCovers = (t: Tier) => ent.source === 'founding' && ent.tier === t;

  async function handleContinue() {
    // ── Sign-up flow: no account yet, so remember the choice for later.
    if (!isMember) {
      if (selected !== 'freemium') await savePendingProfile({ intended_plan: selected });
      const { data: { user } } = await supabase.auth.getUser();
      const name = user?.user_metadata?.full_name || user?.email?.split('@')[0] || '';
      navigation.navigate('Welcome', { userName: name });
      return;
    }

    // ── Signed-in member
    if (selected === 'freemium') {
      if (ent.tier !== 'freemium' && ent.source !== 'founding') {
        Alert.alert(
          'Switch to Community',
          `Paid plans are managed by ${STORE_NAME}. Turn off auto-renew there and you'll move to Community when this period ends.`,
          [{ text: 'Not now', style: 'cancel' }, { text: `Open ${STORE_NAME}`, onPress: () => openManageSubscriptions() }],
        );
        return;
      }
      navigation.goBack();
      return;
    }

    const plan = plans[selected];
    if (!plan || !purchasesAvailable()) {
      Alert.alert(
        'Purchases unavailable',
        `We couldn't reach ${STORE_NAME} right now. Check your connection and try again.`,
      );
      return;
    }
    setBusy('buy');
    try {
      const outcome = await buyPlan(plan);
      if (outcome === 'purchased') {
        await ent.refresh();
        Alert.alert('Welcome aboard!', `You're now on ${TIER_LABEL[selected]}.`, [
          { text: 'Done', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (e: any) {
      console.log('Purchase error:', e?.message ?? e);
      Alert.alert('Purchase failed', e?.message ?? 'Please try again.');
    } finally {
      setBusy(null);
    }
  }

  async function handleRestore() {
    setBusy('restore');
    try {
      const restored = await restorePurchases();
      await ent.refresh();
      Alert.alert(restored ? 'Purchases restored' : 'Nothing to restore',
        restored ? 'Your subscription is active on this device.' : `We didn't find an active subscription for this ${STORE_NAME} account.`);
    } catch (e: any) {
      Alert.alert('Restore failed', e?.message ?? 'Please try again.');
    } finally {
      setBusy(null);
    }
  }

  function buttonLabel() {
    if (!isMember) return 'Continue';
    if (isCurrent(selected)) return 'Current plan';
    if (selected === 'freemium') return 'Continue with Community';
    return trialFor(selected as PaidTier) ? 'Start 30-day free trial' : `Subscribe for ${priceFor(selected as PaidTier)}/month`;
  }

  const buttonDisabled = busy !== null || (isMember && isCurrent(selected));

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10} accessibilityLabel="Close">
          <Ionicons name="close" size={26} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Image source={require('../../../assets/BarterLogo.png')} style={styles.headerLogo} resizeMode="contain" />
          <Text style={styles.headerTitle}>The Barter Shop</Text>
        </View>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.selectTitle}>{isMember ? 'Your membership' : 'Select a plan'}</Text>

        {isMember && ent.isFoundingMember && ent.source === 'founding' && (
          <View style={styles.foundingBanner}>
            <Ionicons name="ribbon" size={20} color="#8B6914" />
            <Text style={styles.foundingText}>
              Founding Member — {TIER_LABEL[ent.tier]} is free until {formatDate(ent.expiresAt)}. Thank you for building this with us.
            </Text>
          </View>
        )}

        {/* Community */}
        <TouchableOpacity style={[styles.planCard, selected === 'freemium' && styles.planCardSelected]} onPress={() => setSelected('freemium')}>
          <View style={styles.planHeader}>
            <Text style={styles.planName}>Community</Text>
            {isCurrent('freemium') && <Text style={styles.currentBadge}>CURRENT</Text>}
          </View>
          <View style={styles.priceRow}><Text style={styles.priceBig}>Free</Text></View>
          <View style={styles.features}>
            <Feature included text="Access to community barter feed" />
            <Feature included text="Swipe and match with other barterers" />
            <Feature included text="Basic messaging" />
            <Feature included text="Up to 3 active listings" />
            <Feature included text="Earn and spend Barter Bucks" />
            <Feature included={false} text="No verification badge" />
            <Feature included={false} text="No priority placement" />
          </View>
        </TouchableOpacity>

        {/* Verified Pro */}
        <TouchableOpacity style={[styles.planCard, selected === 'verified_pro' && styles.planCardSelected, { borderColor: colors.primary }]} onPress={() => setSelected('verified_pro')}>
          <View style={styles.planHeader}>
            <Text style={styles.planName}>Verified Pro</Text>
            {isCurrent('verified_pro') ? <Text style={styles.currentBadge}>CURRENT</Text> : <Ionicons name="shield-checkmark" size={20} color={colors.primary} />}
          </View>
          <View style={styles.priceRow}><Text style={styles.priceBig}>{priceFor('verified_pro')}</Text><Text style={styles.priceSmall}>/month</Text></View>
          {foundingCovers('verified_pro') ? (
            <Text style={styles.trialNote}>Free for you until {formatDate(ent.expiresAt)}</Text>
          ) : trialFor('verified_pro') ? (
            <Text style={styles.trialNote}>30-day free trial</Text>
          ) : null}
          <View style={styles.features}>
            <Feature included text="Everything in Community" />
            <Feature included text="Verified badge on profile" />
            <Feature included text="Priority placement in search" />
            <Feature included text="Up to 10 active listings" />
            <Feature included text="Advanced profile analytics" />
            <Feature included text="Trust score boost" />
            <Feature included text="48-hour match guarantee" />
          </View>
        </TouchableOpacity>

        {/* Business */}
        <TouchableOpacity style={[styles.planCard, selected === 'business' && styles.planCardSelectedCoral]} onPress={() => setSelected('business')}>
          <View style={styles.planHeader}>
            <Text style={styles.planName}>Business</Text>
            {isCurrent('business') ? <Text style={styles.currentBadge}>CURRENT</Text> : <Ionicons name="business" size={20} color="#FF6B6B" />}
          </View>
          <View style={styles.priceRow}><Text style={styles.priceBig}>{priceFor('business')}</Text><Text style={styles.priceSmall}>/month</Text></View>
          {foundingCovers('business') ? (
            <Text style={styles.trialNote}>Free for you until {formatDate(ent.expiresAt)}</Text>
          ) : trialFor('business') ? (
            <Text style={styles.trialNote}>30-day free trial</Text>
          ) : null}
          <View style={styles.features}>
            <Feature included text="Everything in Verified Pro" />
            <Feature included text="Access to vetted barter professionals" />
            <Feature included text="Customized barter agreements" />
            <Feature included text="Unlimited active listings" />
            <Feature included text="Featured placement in home feed" />
            <Feature included text="Business analytics dashboard" />
            <Feature included text="Priority customer support" />
            <Feature included text="48-hour match guarantee" />
          </View>
        </TouchableOpacity>

        <View style={styles.guaranteeSection}>
          <Text style={styles.guaranteeTitle}>Our Guarantee</Text>
          <Text style={styles.guaranteeBody}>Join any paid plan and we guarantee your first barter match within 48 hours. If we can't find you a local match we expand your search nationally and personally introduce you to 3 remote barterers who need your skill. If we still can't match you — your trial extends by 30 days. Automatically. No questions asked.</Text>
          <GuaranteePills />
        </View>

        <View style={styles.whitelabelCard}>
          <Text style={styles.planName}>White Label & API</Text>
          <Text style={styles.whitelabelDesc}>For organizations, schools, and communities</Text>
          <Text style={styles.whitelabelCustom}>Custom pricing</Text>
          <Text style={styles.whitelabelSubdesc}>Create your own barter economy powered by The Barter Shop</Text>
          <TouchableOpacity style={styles.contactBtn} onPress={() => Linking.openURL('mailto:info@thebartershop.app')}>
            <Text style={styles.contactBtnText}>Contact us</Text>
          </TouchableOpacity>
        </View>

        {/* Required subscription disclosures */}
        <Text style={styles.legal}>
          {isMember
            ? `Paid plans renew monthly at the price shown until cancelled. Free trials convert to a paid subscription at the end of the trial unless cancelled at least 24 hours before it ends. Payment is charged to your ${STORE_NAME} account. Manage or cancel anytime in your ${STORE_NAME} account settings.`
            : 'Paid plans include a 30-day free trial, which you can start right after you confirm your email. You won\'t be charged today.'}
        </Text>
        <View style={styles.legalLinks}>
          <Text style={styles.legalLink} onPress={() => navigation.navigate('TermsOfUse')}>Terms of Use</Text>
          <Text style={styles.legalDot}>·</Text>
          <Text style={styles.legalLink} onPress={() => navigation.navigate('PrivacyPolicy')}>Privacy Policy</Text>
          {isMember && (
            <>
              <Text style={styles.legalDot}>·</Text>
              <Text style={styles.legalLink} onPress={handleRestore}>Restore Purchases</Text>
            </>
          )}
        </View>
        {isMember && (ent.source === 'app_store' || ent.source === 'play_store') && (
          <TouchableOpacity onPress={() => openManageSubscriptions()} style={{ alignSelf: 'center' }}>
            <Text style={styles.legalLink}>Manage subscription</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom || 16 }]}>
        <TouchableOpacity
          style={[styles.continueBtn, buttonDisabled && { opacity: 0.5 }]}
          onPress={handleContinue}
          disabled={buttonDisabled}
        >
          {busy === 'buy' ? <ActivityIndicator color="#FFF" /> : <Text style={styles.continueBtnText}>{buttonLabel()}</Text>}
        </TouchableOpacity>
        <Text style={styles.cancelText}>Cancel anytime. No contracts.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8 },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerLogo: { width: 28, height: 28 },
  headerTitle: { fontSize: fontSize.md, fontWeight: '700', color: '#000' },
  content: { padding: 24, paddingBottom: 140, gap: 12 },
  selectTitle: { fontSize: 28, fontWeight: '700', color: '#000', marginBottom: 8 },

  foundingBanner: { flexDirection: 'row', gap: 10, alignItems: 'center', backgroundColor: '#FFFDE7', borderRadius: 12, padding: 14 },
  foundingText: { flex: 1, fontSize: fontSize.sm, color: '#5C4A0A', lineHeight: 20, fontFamily: fonts.semiBold },

  planCard: { borderWidth: 1.5, borderColor: '#E0E0E0', borderRadius: 16, padding: 16, gap: 8 },
  planCardSelected: { borderColor: colors.primary, backgroundColor: '#F0FAFB' },
  planCardSelectedCoral: { borderColor: '#FF6B6B', backgroundColor: '#FFF5F5' },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  planName: { fontSize: fontSize.lg, fontWeight: '700', color: '#000' },
  currentBadge: { fontSize: 10, fontWeight: '800', color: colors.primary, letterSpacing: 1 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline' },
  priceBig: { fontSize: 32, fontWeight: '900', color: '#000' },
  priceSmall: { fontSize: fontSize.sm, color: '#999' },
  trialNote: { fontSize: fontSize.xs, color: '#8B6914', fontWeight: '700' },
  features: { gap: 6, marginTop: 4 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featureText: { fontSize: fontSize.xs, color: '#666' },

  whitelabelCard: { borderWidth: 1.5, borderColor: '#E0E0E0', borderRadius: 16, padding: 16, gap: 6 },
  whitelabelDesc: { fontSize: fontSize.xs, color: '#999' },
  whitelabelCustom: { fontSize: 20, fontWeight: '700', color: '#000' },
  whitelabelSubdesc: { fontSize: fontSize.xs, color: '#999', lineHeight: 18 },
  contactBtn: { backgroundColor: colors.primary, paddingVertical: 10, borderRadius: borderRadius.full, alignItems: 'center', marginTop: 8 },
  contactBtnText: { color: '#FFF', fontSize: fontSize.sm, fontWeight: '700' },

  legal: { fontSize: 11, color: '#999', lineHeight: 16, textAlign: 'center', marginTop: spacing.sm },
  legalLinks: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 6 },
  legalLink: { fontSize: 12, color: colors.primary, fontWeight: '600' },
  legalDot: { fontSize: 12, color: '#CCC' },

  bottomBar: { paddingHorizontal: 24, paddingTop: 12, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#F0F0F0', alignItems: 'center', gap: 8 },
  continueBtn: { backgroundColor: colors.primary, height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center', width: '100%' },
  continueBtnText: { color: '#FFF', fontSize: fontSize.md, fontWeight: '700' },
  cancelText: { fontSize: fontSize.xs, color: '#999' },
  guaranteeSection: { alignItems: 'center', gap: 12, paddingVertical: spacing.md },
  guaranteeTitle: { fontSize: fontSize.md, fontWeight: '700', color: '#000', fontFamily: fonts.bold },
  guaranteeBody: { fontSize: 13, color: '#999', textAlign: 'center', lineHeight: 20, paddingHorizontal: spacing.md, fontFamily: fonts.regular },
});
