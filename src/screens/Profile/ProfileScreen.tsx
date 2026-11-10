import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { colors, spacing, fontSize, borderRadius, fonts } from '../../theme';
import { useBarterBucks, TIERS } from '../../context/BarterBucksContext';
import AppImage from '../../components/AppImage';
import MembershipBadge from '../../components/MembershipBadge';
import BarterBucksIcon from '../../components/BarterBucksIcon';
import { useAuth } from '../../context/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type TabName = 'Product' | 'About' | 'Reviews';

// ── Data ───────────────────────────────────────────────────
const LISTINGS = [
  { id: '1', icon: '👨‍🍳', name: 'Cooking Service', price: 'From $500' },
  { id: '2', icon: '📸', name: 'Photography', price: 'From $300' },
  { id: '3', icon: '💪', name: 'Fitness Training', price: 'From $200' },
];

const REVIEWS = [
  { id: '1', name: 'Robert Fox', stars: 5, text: 'Amazing trainer! Marcus really pushed me to my limits and I saw results in just 2 weeks.', color: '#E8B4B8' },
  { id: '2', name: 'Sarah Johnson', stars: 5, text: 'Super professional and talented. Would barter with her again in a heartbeat!', color: '#B4C7E8' },
  { id: '3', name: 'Mike Chen', stars: 4, text: 'Great experience overall. Communication was clear and the service exceeded expectations.', color: '#C8E8B4' },
  { id: '4', name: 'Priya Patel', stars: 5, text: 'This is exactly what the barter economy needs. Love this platform!', color: '#E8D4B4' },
  { id: '5', name: 'James Wilson', stars: 5, text: 'Incredible value. Got a full branding package in exchange for 3 cooking lessons.', color: '#D4B4E8' },
];

function Stars({ count, size = 13 }: { count: number; size?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 1 }}>
      {Array.from({ length: 5 }, (_, i) => (
        <Text key={i} style={{ color: i < count ? '#FFD700' : '#E0E0E0', fontSize: size }}>★</Text>
      ))}
    </View>
  );
}

// ── Tab Content Components ─────────────────────────────────
function ProductTab() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const cardWidth = (SCREEN_WIDTH - spacing.md * 2 - 10) / 2;

  return (
    <View style={tabStyles.container}>
      <View style={tabStyles.listingsHeader}>
        <Text style={tabStyles.listingsCount}>3 listings</Text>
        <TouchableOpacity>
          <Text style={tabStyles.manageLink}>Manage listings</Text>
        </TouchableOpacity>
      </View>

      <View style={tabStyles.grid}>
        <TouchableOpacity
          style={[tabStyles.createCard, { width: cardWidth }]}
          onPress={() => navigation.navigate('CreateListing')}
        >
          <Ionicons name="add" size={32} color="#999" />
          <Text style={tabStyles.createCardText}>Create new listing</Text>
        </TouchableOpacity>

        {LISTINGS.map((listing) => (
          <View key={listing.id} style={[tabStyles.listingCard, { width: cardWidth }]}>
            <View style={tabStyles.listingImage}>
              <Text style={tabStyles.listingEmoji}>{listing.icon}</Text>
            </View>
            <View style={tabStyles.listingInfo}>
              <Text style={tabStyles.listingName} numberOfLines={1}>{listing.name}</Text>
              <Text style={tabStyles.listingPrice}>{listing.price}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function AboutTab() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <View style={tabStyles.container}>
      {/* Upload Documents */}
      <Text style={tabStyles.sectionTitle}>Upload Document</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={tabStyles.docsRow}>
        <View style={tabStyles.docCard}>
          <Ionicons name="document-outline" size={28} color="#999" />
          <Text style={tabStyles.docLabel}>Certificates</Text>
        </View>
        <View style={[tabStyles.docCard, tabStyles.docCardUploaded]}>
          <Ionicons name="document" size={28} color="#8B6914" />
          <Text style={tabStyles.docLabelUploaded}>Insurance.pdf</Text>
        </View>
        <View style={tabStyles.docCard}>
          <Ionicons name="document-outline" size={28} color="#999" />
          <Text style={tabStyles.docLabel}>Business License</Text>
        </View>
      </ScrollView>

      {/* Upgrade Card */}
      <View style={tabStyles.upgradeCard}>
        <View style={tabStyles.upgradeHeader}>
          <Text style={tabStyles.upgradeTitle}>Verified Pro</Text>
          <View style={tabStyles.upgradePrice}>
            <Text style={tabStyles.upgradePriceBig}>$9</Text>
            <Text style={tabStyles.upgradePriceSmall}>/month</Text>
          </View>
        </View>
        <View style={tabStyles.upgradeBenefit}>
          <View style={tabStyles.upgradeBenefitCheck}>
            <Ionicons name="checkmark" size={14} color="#FFF" />
          </View>
          <Text style={tabStyles.upgradeBenefitText}>
            Verified badge, priority placement, up to 10 active listings, and advanced analytics
          </Text>
        </View>
        <View style={tabStyles.upgradeActions}>
          <TouchableOpacity style={tabStyles.upgradeButton} onPress={() => navigation.navigate('Subscription')}>
            <Text style={tabStyles.upgradeButtonText}>Upgrade</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Subscription')}>
            <Text style={tabStyles.seeAllText}>See all plans</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Barter Bucks Widget */}
      <BBWidget />
    </View>
  );
}

function BBWidget() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { balance, currentTier, currentTierIndex, bbToNextTier, transactions } = useBarterBucks();
  const nextTier = TIERS[Math.min(currentTierIndex + 1, TIERS.length - 1)];
  const progress = currentTierIndex < TIERS.length - 1
    ? (balance - currentTier.minBB) / (nextTier.minBB - currentTier.minBB)
    : 1;

  return (
    <View style={tabStyles.progressSection}>
      {/* Balance Card */}
      <View style={tabStyles.bbBalanceCard}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <BarterBucksIcon size={28} />
          <Text style={tabStyles.bbBalanceTitle}>Barter Bucks</Text>
        </View>
        <Text style={tabStyles.bbBalanceNumber}>{balance}</Text>
        <View style={tabStyles.bbTierPill}>
          <Text style={tabStyles.bbTierPillText}>{currentTier.icon} {currentTier.name}</Text>
        </View>
        <View style={tabStyles.bbProgressBar}>
          <View style={[tabStyles.bbProgressFill, { flex: progress || 0.01 }]} />
          <View style={{ flex: 1 - (progress || 0.01) }} />
        </View>
        {bbToNextTier > 0 && (
          <Text style={tabStyles.bbProgressLabel}>{bbToNextTier} BB to {nextTier.name}</Text>
        )}
        <TouchableOpacity onPress={() => navigation.navigate('BarterBucksGuide')}>
          <Text style={tabStyles.bbHowLink}>How it works</Text>
        </TouchableOpacity>
      </View>

      {/* Tier Progress */}
      <View style={tabStyles.tierRow}>
        {TIERS.map((tier, i) => (
          <View key={tier.name} style={tabStyles.tierItem}>
            <View style={[tabStyles.tierDot, i <= currentTierIndex && tabStyles.tierDotFilled]}>
              <Text style={{ fontSize: 10 }}>{tier.icon}</Text>
            </View>
            <Text style={tabStyles.tierLabel}>{tier.name}</Text>
          </View>
        ))}
      </View>

      {/* Recent Activity */}
      <Text style={tabStyles.bbRecentTitle}>Recent Earnings</Text>
      {transactions.slice(0, 5).map((tx) => (
        <View key={tx.id} style={tabStyles.bbTxRow}>
          <Text style={{ fontSize: 16 }}>{tx.icon}</Text>
          <Text style={tabStyles.bbTxDesc}>{tx.description}</Text>
          <Text style={tabStyles.bbTxDate}>{tx.date}</Text>
          <Text style={tabStyles.bbTxAmount}>+{tx.amount} BB</Text>
        </View>
      ))}
    </View>
  );
}

function ReviewsTab() {
  return (
    <View style={tabStyles.container}>
      {REVIEWS.map((review) => (
        <View key={review.id} style={tabStyles.reviewRow}>
          <View style={[tabStyles.reviewAvatar, { backgroundColor: review.color }]}>
            <Text style={tabStyles.reviewAvatarText}>{review.name[0]}</Text>
          </View>
          <View style={tabStyles.reviewContent}>
            <Text style={tabStyles.reviewName}>{review.name}</Text>
            <Stars count={review.stars} />
            <Text style={tabStyles.reviewText}>{review.text}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

// ── Main Screen ────────────────────────────────────────────
function GuestProfile() {
  const insets = useSafeAreaInsets();
  const { exitGuest } = useAuth();
  return (
    <View style={[styles.container, guestStyles.wrap, { paddingTop: insets.top }]}>
      <Ionicons name="person-circle-outline" size={96} color={colors.primary} />
      <Text style={guestStyles.title}>Your profile lives here</Text>
      <Text style={guestStyles.body}>
        Create a free account to list your skills, get verified, and start trading.
      </Text>
      <TouchableOpacity style={guestStyles.btn} onPress={exitGuest}>
        <Text style={guestStyles.btnText}>Create my account</Text>
      </TouchableOpacity>
    </View>
  );
}

const guestStyles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl, gap: spacing.md },
  title: { fontSize: 22, fontWeight: '800', color: '#000', fontFamily: fonts.extraBold, textAlign: 'center' },
  body: { fontSize: fontSize.md, color: '#666', textAlign: 'center', lineHeight: 22, fontFamily: fonts.regular },
  btn: { backgroundColor: colors.primary, paddingVertical: 14, paddingHorizontal: 32, borderRadius: borderRadius.full, marginTop: spacing.sm },
  btnText: { color: '#FFF', fontSize: fontSize.md, fontWeight: '700', fontFamily: fonts.bold },
});

export default function ProfileScreen() {
  const { isGuest } = useAuth();
  if (isGuest) return <GuestProfile />;
  return <MemberProfile />;
}

function MemberProfile() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [activeTab, setActiveTab] = useState<TabName>('Product');
  const { balance: bbBalance } = useBarterBucks();

  const TABS: TabName[] = ['Product', 'About', 'Reviews'];

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ──────────────── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => navigation.navigate('BarterBucksGuide')}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <BarterBucksIcon size={18} />
              <Text style={styles.coinText}> {bbBalance}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')} hitSlop={10} accessibilityLabel="Settings">
            <Ionicons name="settings-outline" size={22} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Avatar Section ──────── */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarWrapper}>
          <View style={styles.avatar}>
            <AppImage
              uri="https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?w=100&h=100&fit=crop"
              width={84}
              height={84}
              borderRadius={42}
              fallbackText="J"
            />
          </View>
          <View style={styles.editBadge}>
            <Ionicons name="pencil" size={12} color="#FFF" />
          </View>
          <MembershipBadge status="unverified" size={64} showLabel />
        </View>

        <View style={styles.avatarInfo}>
          <View style={styles.userBadge}>
            <Ionicons name="person" size={10} color="#FFF" />
            <Text style={styles.userBadgeText}>Individual</Text>
          </View>
          <Text style={styles.userName}>My Profile</Text>
          <View style={styles.ratingRow}>
            <Text style={styles.ratingValue}>5.0</Text>
            <Stars count={5} size={14} />
            <Text style={styles.ratingCount}>(10)</Text>
          </View>
          <Text style={styles.joinedText}>Joined 1y 2m</Text>
        </View>
      </View>

      {/* ── Tabs ────────────────── */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={styles.tab}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab}
            </Text>
            {activeTab === tab && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Tab Content ─────────── */}
      {activeTab === 'Product' && <ProductTab />}
      {activeTab === 'About' && <AboutTab />}
      {activeTab === 'Reviews' && <ReviewsTab />}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

// ── Main Styles ────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: '#000',
    fontFamily: fonts.extraBold,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  coinText: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: '#000',
    fontFamily: fonts.bold,
  },

  // Avatar
  avatarSection: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
    alignItems: 'center',
  },
  avatarWrapper: {
    alignItems: 'center',
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#F0F7F8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.primary,
  },
  avatarEmoji: {
    fontSize: 40,
  },
  editBadge: {
    position: 'absolute',
    bottom: 18,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  completeBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    marginTop: -10,
  },
  completeBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '700',
  },
  avatarInfo: {
    flex: 1,
    gap: 3,
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  userBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    fontFamily: fonts.extraBold,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
  },
  ratingCount: {
    fontSize: 13,
    color: '#999',
  },
  joinedText: {
    fontSize: 13,
    color: '#999',
    fontFamily: fonts.regular,
  },

  // Tabs
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  tabText: {
    fontSize: 15,
    color: '#999',
    fontWeight: '500',
    fontFamily: fonts.semiBold,
  },
  tabTextActive: {
    color: '#000',
    fontWeight: '700',
    fontFamily: fonts.bold,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    width: '60%',
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 1.5,
  },
});

// ── Tab Styles ─────────────────────────────────────────────
const tabStyles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },

  // Product Tab
  listingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  listingsCount: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: '#000',
    fontFamily: fonts.bold,
  },
  manageLink: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '600',
    fontFamily: fonts.semiBold,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  createCard: {
    height: 180,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  createCardText: {
    fontSize: fontSize.xs,
    color: '#999',
  },
  listingCard: {
    height: 180,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
  },
  listingImage: {
    flex: 0.6,
    backgroundColor: '#E8F4F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listingEmoji: {
    fontSize: 36,
  },
  listingInfo: {
    flex: 0.4,
    padding: 8,
    justifyContent: 'center',
  },
  listingName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
    fontFamily: fonts.bold,
  },
  listingPrice: {
    fontSize: fontSize.xs,
    color: '#999',
    marginTop: 2,
    fontFamily: fonts.regular,
  },

  // About Tab
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: '#000',
    marginBottom: spacing.sm,
    fontFamily: fonts.bold,
  },
  docsRow: {
    gap: 10,
    marginBottom: spacing.lg,
  },
  docCard: {
    width: 110,
    height: 90,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  docCardUploaded: {
    backgroundColor: '#FFF8E1',
    borderStyle: 'solid',
    borderColor: '#FFD700',
  },
  docLabel: {
    fontSize: 10,
    color: '#999',
  },
  docLabelUploaded: {
    fontSize: 10,
    color: '#8B6914',
    fontWeight: '600',
  },

  // Upgrade Card
  upgradeCard: {
    backgroundColor: '#FF6B6B',
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  upgradeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  upgradeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  upgradePrice: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  upgradePriceBig: {
    fontSize: 28,
    fontWeight: '900',
    color: '#000',
  },
  upgradePriceSmall: {
    fontSize: 14,
    color: '#000',
    marginBottom: 4,
  },
  upgradeBenefit: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  upgradeBenefitCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  upgradeBenefitText: {
    flex: 1,
    fontSize: fontSize.xs,
    color: '#000',
    lineHeight: 18,
  },
  upgradeActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  upgradeButton: {
    backgroundColor: '#D32F2F',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: borderRadius.full,
  },
  upgradeButtonText: {
    color: '#FFF',
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  seeAllText: {
    fontSize: fontSize.sm,
    color: '#000',
    fontWeight: '600',
  },

  // Progress
  progressSection: {
    gap: spacing.md,
  },
  progressTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: '#000',
  },
  progressNumber: {
    color: colors.primary,
  },
  progressSubtitle: {
    fontSize: fontSize.xs,
    color: '#999',
    marginTop: -8,
  },
  tierRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tierItem: {
    alignItems: 'center',
    gap: 4,
  },
  tierDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
  },
  tierDotFilled: {
    backgroundColor: colors.primary,
  },
  tierLabel: {
    fontSize: 9,
    color: '#999',
  },
  progressRing: {
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  progressRingBorder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 6,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressRingNumber: {
    fontSize: 36,
    fontWeight: '900',
    color: colors.primary,
  },
  progressRingText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
  },
  progressRingSubtext: {
    fontSize: 9,
    color: '#999',
  },
  bbInfo: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'flex-start',
    backgroundColor: '#F8F8F8',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  bbInfoText: {
    flex: 1,
    fontSize: 11,
    color: '#999',
    lineHeight: 16,
  },

  // BB Widget
  bbBalanceCard: { backgroundColor: '#FFFDE7', borderRadius: 16, padding: spacing.md, alignItems: 'center', gap: 8, marginBottom: spacing.md },
  bbBalanceTitle: { fontSize: fontSize.md, fontWeight: '700', color: '#000' },
  bbBalanceNumber: { fontSize: 36, fontWeight: '900', color: colors.primary },
  bbTierPill: { backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 4, borderRadius: borderRadius.full },
  bbTierPillText: { color: '#FFF', fontSize: fontSize.xs, fontWeight: '600' },
  bbProgressBar: { flexDirection: 'row', height: 6, borderRadius: 3, overflow: 'hidden', width: '80%', backgroundColor: '#E0E0E0' },
  bbProgressFill: { backgroundColor: colors.primary },
  bbProgressLabel: { fontSize: fontSize.xs, color: '#999' },
  bbHowLink: { color: colors.primary, fontSize: fontSize.sm, fontWeight: '600', marginTop: 4 },
  bbRecentTitle: { fontSize: fontSize.md, fontWeight: '700', color: '#000', marginTop: spacing.md, marginBottom: spacing.sm },
  bbTxRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  bbTxDesc: { flex: 1, fontSize: fontSize.xs, color: '#333' },
  bbTxDate: { fontSize: 10, color: '#999' },
  bbTxAmount: { fontSize: fontSize.xs, fontWeight: '700', color: colors.primary },

  // Reviews Tab
  reviewRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  reviewAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  reviewContent: {
    flex: 1,
    gap: 4,
  },
  reviewName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
    fontFamily: fonts.bold,
  },
  reviewText: {
    fontSize: 13,
    color: '#999',
    lineHeight: 18,
    fontFamily: fonts.regular,
  },
});
