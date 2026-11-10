import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { useBarterBucks, TIERS, Perk } from '../../context/BarterBucksContext';
import { useRequireAccount } from '../../context/AuthContext';
import { colors, spacing, fontSize, borderRadius } from '../../theme';
import BarterBucksIcon from '../../components/BarterBucksIcon';
import BuyBarterBucksSheet from '../../components/BuyBarterBucksSheet';

type Props = NativeStackScreenProps<RootStackParamList, 'BarterBucksGuide'>;

const EARN_TABLE = [
  { icon: '🎉', action: 'Join and confirm your email', amount: '+5 BB' },
  { icon: '🤝', action: 'Complete a Full Barter', amount: '+2 BB' },
  { icon: '🔄', action: 'Complete a Partial Barter', amount: '+1 BB' },
  { icon: '⭐', action: 'Receive a 5-star review', amount: '+1 BB' },
  { icon: '✅', action: 'Get verified (Pro/Business)', amount: '+5 BB' },
  { icon: '🆕', action: 'Complete your profile 100%', amount: '+2 BB' },
];

const SPEND_TABLE: { icon: string; perk: Perk; label: string; cost: number }[] = [
  { icon: '🚀', perk: 'boost_listing', label: 'Boost listing (24 hours)', cost: 2 },
  { icon: '👑', perk: 'featured_barterer', label: 'Featured Barterer (1 week)', cost: 3 },
  { icon: '📊', perk: 'premium_analytics', label: 'Premium analytics (1 month)', cost: 1 },
  { icon: '⬆️', perk: 'tier_promotion', label: 'Temp tier promotion (1 trade)', cost: 5 },
];

const FAQS = [
  { q: 'Do Barter Bucks expire?', a: 'No! Your Barter Bucks never expire. Keep earning and save them for the perks that matter most to you.' },
  { q: 'Can I buy Barter Bucks?', a: 'Yes — 5 for $5, 20 for $10, or 50 for $19.99. Purchased Barter Bucks cover the difference in a partial barter (1 Barter Buck = $1 of difference). They can\'t be used for perks; perks use the Barter Bucks you earn.' },
  { q: 'What\'s the difference between earned and purchased Barter Bucks?', a: 'Earned Barter Bucks come from activity — your welcome bonus, completed barters, reviews, verification — and work for both perks and trades. Purchased ones work only in trades. When you cover a difference, purchased Barter Bucks are used first. Your Barter Tier is based on earned Barter Bucks only.' },
  { q: 'Can I cash out Barter Bucks?', a: 'No. Barter Bucks have no cash value and can\'t be exchanged for money — they only work inside The Barter Shop.' },
  { q: 'What happens to my BBs if I cancel a paid plan?', a: 'Nothing — your Barter Bucks stay in your wallet whether you are on Community, Verified Pro, or Business.' },
  { q: 'Can I transfer BBs to another user?', a: 'Only inside a barter. When a trade isn\'t perfectly even, both of you can write a Barter Bucks amount into the barter agreement; once you\'ve both signed, those Barter Bucks move to the other member. There are no open transfers.' },
  { q: 'How do I earn Barter Bucks for a completed barter?', a: 'They\'re added automatically when a barter is marked complete — no need to claim them. Reviews and verification rewards work the same way.' },
  { q: 'How do tier promotions work?', a: 'Spending 5 BB gives you one temporary upgrade to barter with a higher-tier member. After that single transaction, you return to your home tier. The BB goes to The Barter Shop.' },
];

function TableRow({ icon, text, value }: { icon: string; text: string; value: string }) {
  return (
    <View style={styles.tableRow}>
      <Text style={styles.tableIcon}>{icon}</Text>
      <Text style={styles.tableText}>{text}</Text>
      <Text style={styles.tableValue}>{value}</Text>
    </View>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <TouchableOpacity style={styles.faqItem} onPress={() => setOpen(!open)} activeOpacity={0.7}>
      <View style={styles.faqHeader}>
        <Text style={styles.faqQ}>{q}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color="#999" />
      </View>
      {open && <Text style={styles.faqA}>{a}</Text>}
    </TouchableOpacity>
  );
}

export default function BarterBucksGuideScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { balance, earnedBalance, purchasedBalance, currentTier, currentTierIndex, bbToNextTier, transactions, redeemPerk } = useBarterBucks();
  const [showBuy, setShowBuy] = useState(false);
  const requireAccount = useRequireAccount();
  const [showHistory, setShowHistory] = useState(false);
  const [redeeming, setRedeeming] = useState<Perk | null>(null);

  function confirmRedeem(row: (typeof SPEND_TABLE)[number]) {
    if (!requireAccount('use Barter Bucks')) return;
    if (earnedBalance < row.cost) {
      Alert.alert(
        'Not enough earned Barter Bucks',
        `${row.label} costs ${row.cost} earned BB. You have ${earnedBalance} earned${purchasedBalance ? ` (purchased Barter Bucks can only be used in trades)` : ''}. Complete barters and get reviews to earn more.`,
      );
      return;
    }
    Alert.alert(row.label, `Spend ${row.cost} Barter Bucks? You'll have ${earnedBalance - row.cost} earned left.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: `Spend ${row.cost} BB`,
        onPress: async () => {
          setRedeeming(row.perk);
          try {
            await redeemPerk(row.perk);
            Alert.alert('Done!', `${row.label} is active.`);
          } catch (e: any) {
            Alert.alert('Could not redeem', e?.message ?? 'Please try again.');
          } finally {
            setRedeeming(null);
          }
        },
      },
    ]);
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={26} color="#000" />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <BarterBucksIcon size={22} />
          <Text style={styles.headerTitle}> Barter Bucks</Text>
        </View>
        <View style={{ width: 26 }} />
      </View>
      <Text style={styles.headerSubtitle}>Your in-app currency for the barter economy</Text>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Section 1: What Are BB */}
        <Text style={styles.sectionHeader}>What are Barter Bucks?</Text>
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Text style={styles.cardBody}>
              Barter Bucks (BB) are the official in-app currency of The Barter Shop. They represent your activity and reputation in the barter community. The more you barter, the more you earn — and the more you earn, the more perks you unlock.
            </Text>
            <BarterBucksIcon size={40} />
          </View>
        </View>

        {/* Section 2: How to Earn */}
        <Text style={styles.sectionHeader}>How to Earn</Text>
        <View style={styles.card}>
          {EARN_TABLE.map((row, i) => (
            <TableRow key={i} icon={row.icon} text={row.action} value={row.amount} />
          ))}
        </View>

        {/* Section 3: How to Spend */}
        <Text style={styles.sectionHeader}>How to Spend</Text>
        <View style={styles.card}>
          {SPEND_TABLE.map((row) => (
            <TouchableOpacity key={row.perk} onPress={() => confirmRedeem(row)} disabled={redeeming !== null} accessibilityRole="button">
              <TableRow icon={row.icon} text={row.label} value={redeeming === row.perk ? '…' : `${row.cost} BB  ›`} />
            </TouchableOpacity>
          ))}
          <Text style={styles.spendHint}>Tap a perk to redeem it.</Text>
        </View>

        {/* Section 4: Tier Levels */}
        <Text style={styles.sectionHeader}>Your Barter Tier 🏆</Text>
        <View style={styles.card}>
          <View style={styles.tierRow}>
            {TIERS.map((tier, i) => (
              <View key={tier.name} style={styles.tierItem}>
                <View style={[styles.tierDot, i <= currentTierIndex && styles.tierDotFilled]}>
                  <Text style={styles.tierDotIcon}>{tier.icon}</Text>
                </View>
                <Text style={[styles.tierLabel, i === currentTierIndex && styles.tierLabelActive]}>{tier.name}</Text>
                {i === currentTierIndex && <Text style={styles.youAreHere}>You</Text>}
              </View>
            ))}
          </View>
          {bbToNextTier > 0 && (
            <Text style={styles.tierProgress}>{bbToNextTier} Barter Bucks until {TIERS[currentTierIndex + 1]?.name}</Text>
          )}
        </View>

        {/* Section 5: FAQ */}
        <Text style={styles.sectionHeader}>Frequently Asked Questions</Text>
        <View style={styles.card}>
          {FAQS.map((faq, i) => (
            <FAQItem key={i} q={faq.q} a={faq.a} />
          ))}
        </View>

        {/* Section 6: Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Your Balance</Text>
          <View style={styles.balanceRow}>
            <BarterBucksIcon size={28} />
            <Text style={styles.balanceNumber}>{balance}</Text>
          </View>
          <Text style={styles.balanceSplit}>
            {earnedBalance} earned · {purchasedBalance} purchased
          </Text>
          <TouchableOpacity
            style={styles.buyBtn}
            onPress={() => { if (requireAccount('buy Barter Bucks')) setShowBuy(true); }}
            accessibilityRole="button"
          >
            <Text style={styles.buyBtnText}>Buy Barter Bucks for trades</Text>
          </TouchableOpacity>
          <View style={styles.balanceTierBadge}>
            <Text style={styles.balanceTierText}>{currentTier.icon} {currentTier.name}</Text>
          </View>
          {bbToNextTier > 0 && (
            <Text style={styles.balanceNext}>{bbToNextTier} BB until {TIERS[currentTierIndex + 1]?.name}</Text>
          )}
          <TouchableOpacity style={styles.historyBtn} onPress={() => setShowHistory((v) => !v)}>
            <Text style={styles.historyBtnText}>{showHistory ? 'Hide History' : 'View History'}</Text>
          </TouchableOpacity>
          {showHistory && (
            <View style={styles.historyList}>
              {transactions.length === 0 ? (
                <Text style={styles.historyEmpty}>No Barter Bucks activity yet. Complete your profile to earn your first 2 BB.</Text>
              ) : (
                transactions.map((tx) => (
                  <View key={tx.id} style={styles.historyRow}>
                    <Text style={{ fontSize: 16 }}>{tx.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.historyDesc}>{tx.description}</Text>
                      <Text style={styles.historyDate}>{tx.date}</Text>
                    </View>
                    <Text style={[styles.historyAmount, tx.amount < 0 && styles.historyAmountNeg]}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount} BB
                    </Text>
                  </View>
                ))
              )}
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
      <BuyBarterBucksSheet visible={showBuy} onClose={() => setShowBuy(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: 8 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#000' },
  headerSubtitle: { fontSize: fontSize.sm, color: '#999', textAlign: 'center', marginBottom: spacing.md },
  content: { padding: spacing.md, gap: spacing.md },

  sectionHeader: { fontSize: fontSize.md, fontWeight: '700', color: colors.primary, marginTop: spacing.sm },
  card: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#F0F0F0', borderRadius: 16, padding: spacing.md },
  cardRow: { flexDirection: 'row', gap: 12 },
  cardBody: { flex: 1, fontSize: fontSize.sm, color: '#666', lineHeight: 22 },
  cardEmoji: { fontSize: 40 },

  // Table
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F8F8F8' },
  tableIcon: { fontSize: 18, width: 32 },
  tableText: { flex: 1, fontSize: fontSize.sm, color: '#333' },
  tableValue: { fontSize: fontSize.sm, fontWeight: '700', color: colors.primary },

  // Tiers
  tierRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  tierItem: { alignItems: 'center', gap: 4, flex: 1 },
  tierDot: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center' },
  tierDotFilled: { backgroundColor: colors.primary },
  tierDotIcon: { fontSize: 16 },
  tierLabel: { fontSize: 9, color: '#999' },
  tierLabelActive: { color: colors.primary, fontWeight: '700' },
  youAreHere: { fontSize: 8, color: colors.primary, fontWeight: '700' },
  tierProgress: { fontSize: fontSize.sm, color: colors.primary, textAlign: 'center', fontWeight: '600' },

  // FAQ
  faqItem: { borderBottomWidth: 1, borderBottomColor: '#F8F8F8', paddingVertical: 10 },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQ: { fontSize: fontSize.sm, fontWeight: '600', color: '#000', flex: 1, paddingRight: 8 },
  faqA: { fontSize: fontSize.sm, color: '#666', lineHeight: 20, marginTop: 8 },

  // Balance Card
  balanceCard: { backgroundColor: colors.primary, borderRadius: 16, padding: spacing.lg, alignItems: 'center', gap: 8 },
  balanceLabel: { fontSize: fontSize.sm, color: 'rgba(255,255,255,0.7)' },
  balanceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  balanceCoin: { fontSize: 28 },
  balanceNumber: { fontSize: 32, fontWeight: '900', color: '#FFF' },
  balanceTierBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: borderRadius.full },
  balanceTierText: { color: '#FFF', fontSize: fontSize.sm, fontWeight: '600' },
  balanceNext: { fontSize: fontSize.xs, color: 'rgba(255,255,255,0.7)' },
  balanceSplit: { fontSize: fontSize.xs, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
  buyBtn: { backgroundColor: '#FEED66', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 999, marginTop: 4 },
  buyBtnText: { color: '#1E1E1E', fontSize: fontSize.sm, fontWeight: '800' },
  historyBtn: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)', paddingHorizontal: 20, paddingVertical: 8, borderRadius: borderRadius.full, marginTop: 4 },
  historyBtnText: { color: '#FFF', fontSize: fontSize.sm, fontWeight: '600' },
  spendHint: { fontSize: fontSize.xs, color: '#999', textAlign: 'center', marginTop: spacing.sm },
  historyList: { alignSelf: 'stretch', marginTop: spacing.md, gap: 10 },
  historyEmpty: { fontSize: fontSize.sm, color: 'rgba(255,255,255,0.8)', textAlign: 'center', lineHeight: 20 },
  historyRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  historyDesc: { fontSize: fontSize.sm, color: '#FFF', fontWeight: '600' },
  historyDate: { fontSize: fontSize.xs, color: 'rgba(255,255,255,0.6)' },
  historyAmount: { fontSize: fontSize.sm, color: '#FEED66', fontWeight: '800' },
  historyAmountNeg: { color: 'rgba(255,255,255,0.75)' },
});
