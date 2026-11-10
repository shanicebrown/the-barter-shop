import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { supabase } from '../../config/supabase';
import { colors, spacing, fontSize, borderRadius, fonts } from '../../theme';
import { useNotifications } from '../../context/NotificationsContext';
import AppImage from '../../components/AppImage';
import { getProviderPhoto, getProviderAvatar, getCategoryImage } from '../../constants/images';
import FloatingAIButton from '../../components/FloatingAIButton';
import GuaranteeModal, { GuaranteeInfoButton } from '../../components/GuaranteeModal';
import BarterBucksIcon from '../../components/BarterBucksIcon';
import { useBarterBucks } from '../../context/BarterBucksContext';
import { takeIntendedPlan } from '../../services/PendingProfile';
import MembershipBadge from '../../components/MembershipBadge';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ── Types ──────────────────────────────────────────────────
type UserType = 'Individual' | 'Business' | 'Student';

type Provider = {
  id: string;
  icon: string;
  name: string;
  skill: string;
  location: string;
  distance: string;
  rating: number;
  userType: UserType;
  description: string;
  barterTier: 'full' | 'partial' | 'usd';
};

// ── Sample Data ────────────────────────────────────────────
const PROVIDERS: Provider[] = [
  { id: '1', icon: '💪', name: 'Marcus T.', skill: 'Personal Trainer', location: 'Austin', distance: '1.2km', rating: 4.9, userType: 'Individual', description: 'I offer 1-on-1 fitness training sessions, customized workout plans, and nutrition guidance.', barterTier: 'full' },
  { id: '2', icon: '💇', name: 'Aaliyah R.', skill: 'Hair Stylist', location: 'Austin', distance: '0.8km', rating: 4.8, userType: 'Business', description: 'Specializing in natural hair, braids, locs, and protective styles.', barterTier: 'full' },
  { id: '3', icon: '📸', name: 'Jordan K.', skill: 'Photographer', location: 'Denver', distance: '3.1km', rating: 4.7, userType: 'Individual', description: 'Portrait, event, and brand photography. I bring the studio to you.', barterTier: 'partial' },
  { id: '4', icon: '🎨', name: 'Sofia M.', skill: 'Graphic Designer', location: 'Austin', distance: '2.3km', rating: 5.0, userType: 'Student', description: 'Logo design, brand identity, social media graphics, and pitch decks.', barterTier: 'full' },
  { id: '5', icon: '🔧', name: 'David L.', skill: 'Home Repair', location: 'Dallas', distance: '4.7km', rating: 4.6, userType: 'Business', description: 'Plumbing, electrical, drywall, painting. Licensed and insured.', barterTier: 'partial' },
  { id: '6', icon: '📚', name: 'Priya S.', skill: 'Tutor', location: 'Austin', distance: '1.9km', rating: 4.9, userType: 'Student', description: 'Math, science, and SAT prep for middle and high school students.', barterTier: 'full' },
  { id: '7', icon: '👨‍🍳', name: 'Carlos V.', skill: 'Personal Chef', location: 'Houston', distance: '2.8km', rating: 4.8, userType: 'Business', description: 'Meal prep, dinner parties, and cooking lessons. Farm to table focus.', barterTier: 'partial' },
  { id: '8', icon: '💆', name: 'Zoe W.', skill: 'Massage Therapist', location: 'Austin', distance: '1.5km', rating: 4.7, userType: 'Individual', description: 'Deep tissue, Swedish, and sports massage. Mobile — I come to you.', barterTier: 'full' },
];

const POPULAR_CATEGORIES = [
  { name: 'Photography' },
  { name: 'Product Dev' },
  { name: 'Podcasting' },
  { name: 'Music' },
  { name: 'Fitness' },
  { name: 'Design' },
  { name: 'Legal' },
  { name: 'Cooking' },
];

const BADGE_COLORS: Record<UserType, string> = {
  Individual: '#2196F3',
  Business: '#FF5722',
  Student: '#4CAF50',
};

const BADGE_ICONS: Record<UserType, keyof typeof Ionicons.glyphMap> = {
  Individual: 'person',
  Business: 'business',
  Student: 'school',
};

const RECENT_TIMES = ['27 min ago', '1 hr ago', '2 hrs ago', '45 min ago', '3 hrs ago', '15 min ago', '5 hrs ago', '30 min ago'];

// ── Components ─────────────────────────────────────────────
function UserBadge({ type, style }: { type: UserType; style?: object }) {
  return (
    <View style={[styles.userBadge, { backgroundColor: BADGE_COLORS[type] + 'DD' }, style]}>
      <Ionicons name={BADGE_ICONS[type]} size={10} color={colors.white} />
      <Text style={styles.userBadgeText}>{type}</Text>
    </View>
  );
}

function SectionHeader({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function GridCard({ provider }: { provider: Provider }) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const cardWidth = (SCREEN_WIDTH - spacing.md * 2 - 4 * 2) / 3;

  return (
    <TouchableOpacity
      style={[styles.gridCard, { width: cardWidth }]}
      activeOpacity={0.8}
      onPress={() =>
        navigation.navigate('ProviderDetail', { providerId: provider.id })
      }
    >
      <View style={styles.gridCardImage}>
        <AppImage
          uri={getProviderPhoto(provider.id)}
          width={cardWidth}
          height={140}
          fallbackText={provider.name}
        />
        <View style={styles.gridCardGradient} />
        <UserBadge type={provider.userType} style={styles.gridBadgePosition} />
        <TouchableOpacity style={styles.heartIcon}>
          <Ionicons name="heart-outline" size={16} color={colors.white} />
        </TouchableOpacity>
        <View style={styles.gridBadgeRight}>
          <MembershipBadge status="unverified" size={24} />
        </View>
      </View>
      <View style={styles.gridCardBody}>
        <Text style={styles.gridCardSkill} numberOfLines={2}>{provider.skill}</Text>
        <Text style={styles.gridCardLocation}>{provider.location} · {provider.distance}</Text>
        <View style={styles.gridCardFooter}>
          <AppImage
            uri={getProviderAvatar(provider.id)}
            width={20}
            height={20}
            borderRadius={10}
            fallbackText={provider.name}
          />
          <Ionicons name="star" size={11} color="#FFD700" />
          <Text style={styles.gridRating}>{provider.rating}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ── Main Screen ────────────────────────────────────────────
export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [userName, setUserName] = useState('');
  const [showGuarantee, setShowGuarantee] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase.from('profiles').select('full_name, username').eq('id', user.id).single();
          setUserName(data?.full_name?.split(' ')[0] || data?.username || user.email?.split('@')[0] || '');
          // A paid plan picked during sign-up is offered once, after the first sign-in.
          const plan = await takeIntendedPlan();
          if (plan) navigation.navigate('Subscription', { highlight: plan });
        }
      } catch {}
    })();
  }, [navigation]);
  const { balance: bbBalance } = useBarterBucks();
  const { unreadCount } = useNotifications();
  const [recentPage, setRecentPage] = useState(0);
  const [recommendedPage, setRecommendedPage] = useState(0);

  const recentCarouselRef = useRef<FlatList>(null);
  const recommendedCarouselRef = useRef<FlatList>(null);

  const recentCardWidth = SCREEN_WIDTH * 0.45;
  const recommendedCardWidth = SCREEN_WIDTH - spacing.md * 2;

  function handleRecentScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    setRecentPage(Math.round(e.nativeEvent.contentOffset.x / recentCardWidth));
  }

  function handleRecommendedScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    setRecommendedPage(Math.round(e.nativeEvent.contentOffset.x / recommendedCardWidth));
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: insets.top, backgroundColor: colors.background, zIndex: 10 }} />
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{userName ? `Welcome, ${userName}` : 'Welcome'}</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => navigation.navigate('BarterBucksGuide')} style={styles.bbHeaderBtn}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <BarterBucksIcon size={18} />
              <Text style={styles.bbHeaderText}> {bbBalance}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={{ position: 'relative' }}>
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
            {unreadCount > 0 && (
              <View style={styles.bellBadge}>
                {unreadCount >= 10 ? (
                  <Text style={styles.bellBadgeText}>{unreadCount}</Text>
                ) : null}
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Section 1: Recent Barters Carousel ────────── */}
      <FlatList
        ref={recentCarouselRef}
        data={PROVIDERS.slice(0, 4)}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={recentCardWidth + spacing.sm}
        decelerationRate="fast"
        onMomentumScrollEnd={handleRecentScroll}
        contentContainerStyle={styles.recentCarousel}
        keyExtractor={(item) => 'recent-' + item.id}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={[styles.recentCard, { width: recentCardWidth }]}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('ProviderDetail', { providerId: item.id })}
          >
            <View style={styles.recentCardImage}>
              <AppImage
                uri={getProviderPhoto(item.id)}
                width={recentCardWidth}
                height={120}
                fallbackText={item.name}
              />
              <View style={styles.recentTimeBadge}>
                <Text style={styles.recentTimeText}>Bartered {RECENT_TIMES[index]}</Text>
              </View>
            </View>
            <View style={styles.recentCardBody}>
              <Text style={styles.recentName}>{item.name}</Text>
              <Text style={styles.recentSkill}>{item.skill}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
      <View style={styles.paginationRow}>
        {PROVIDERS.slice(0, 4).map((_, i) => (
          <View key={i} style={[styles.dot, i === recentPage && styles.dotActive]} />
        ))}
      </View>

      {/* ── Section 2: Popular Services ──────────────── */}
      <SectionHeader title="Popular services" onSeeAll={() => {}} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.popularRow}
      >
        {POPULAR_CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.name}
            style={styles.popularCard}
            onPress={() => navigation.navigate('CategoryDetail', { categoryName: cat.name })}
          >
            <View style={styles.popularIcon}>
              <AppImage
                uri={getCategoryImage(cat.name)}
                width={90}
                height={90}
                borderRadius={borderRadius.md}
                fallbackText={cat.name}
              />
              <View style={styles.popularOverlay} />
              <Text style={styles.popularOverlayText}>{cat.name}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Section 3: Who's Nearby ──────────────────── */}
      <SectionHeader title="Who's nearby" onSeeAll={() => {}} />
      <View style={styles.gridContainer}>
        {PROVIDERS.slice(0, 6).map((p) => (
          <GridCard key={'nearby-' + p.id} provider={p} />
        ))}
      </View>

      {/* ── Section 4: Recommended for You ───────────── */}
      <SectionHeader title="Recommended for you" onSeeAll={() => {}} />
      <FlatList
        ref={recommendedCarouselRef}
        data={PROVIDERS.slice(0, 4)}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={recommendedCardWidth + spacing.sm}
        decelerationRate="fast"
        onMomentumScrollEnd={handleRecommendedScroll}
        contentContainerStyle={styles.recommendedCarousel}
        keyExtractor={(item) => 'rec-' + item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.recommendedCard, { width: recommendedCardWidth }]}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('ProviderDetail', { providerId: item.id })}
          >
            <View style={styles.recommendedImage}>
              <AppImage
                uri={getProviderPhoto(item.id)}
                width={recommendedCardWidth}
                height={280}
                fallbackText={item.name}
              />
              <View style={styles.recommendedGradient} />
              <UserBadge type={item.userType} style={styles.recommendedBadgePos} />
              <TouchableOpacity style={styles.recommendedHeart}>
                <Ionicons name="heart-outline" size={20} color={colors.white} />
              </TouchableOpacity>
              <View style={styles.recommendedOverlayInfo}>
                <Text style={styles.recommendedCategory}>{item.skill}</Text>
                <Text style={styles.recommendedName}>{item.name}</Text>
                <View style={styles.recommendedLocationRow}>
                  <Ionicons name="location-outline" size={13} color="rgba(255,255,255,0.7)" />
                  <Text style={styles.recommendedLocation}>{item.location} · {item.distance}</Text>
                </View>
                <View style={styles.recommendedRatingRow}>
                  <Ionicons name="star" size={13} color="#FFD700" />
                  <Text style={styles.recommendedRating}>{item.rating}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
      <View style={styles.paginationRow}>
        {PROVIDERS.slice(0, 4).map((_, i) => (
          <View key={i} style={[styles.dot, i === recommendedPage && styles.dotActive]} />
        ))}
      </View>

      {/* ── Section 5: Trending Now ──────────────────── */}
      <SectionHeader title="Trending Now" onSeeAll={() => {}} />
      <View style={styles.gridContainer}>
        {PROVIDERS.slice(2, 8).map((p) => (
          <GridCard key={'trend-' + p.id} provider={p} />
        ))}
      </View>

      {/* ── Section 6: Barter Again ──────────────────── */}
      <SectionHeader title="Barter Again" onSeeAll={() => {}} />
      <View style={styles.gridContainer}>
        {PROVIDERS.slice(0, 6).map((p) => (
          <GridCard key={'again-' + p.id} provider={p} />
        ))}
      </View>

      {/* ── Section 7: Newly Added ───────────────────── */}
      <SectionHeader title="Newly added" onSeeAll={() => {}} />
      <View style={styles.gridContainer}>
        {[...PROVIDERS].reverse().slice(0, 6).map((p) => (
          <GridCard key={'new-' + p.id} provider={p} />
        ))}
      </View>
    </ScrollView>
    <FloatingAIButton />
    <View style={{ position: 'absolute', bottom: 100, left: 16, zIndex: 50 }}>
      <GuaranteeInfoButton onPress={() => setShowGuarantee(true)} />
    </View>
    <GuaranteeModal visible={showGuarantee} onClose={() => setShowGuarantee(false)} />
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    // Clears the floating AI and guarantee buttons at the end of the feed.
    paddingBottom: 140,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    fontFamily: fonts.extraBold,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bbHeaderBtn: {
    backgroundColor: '#FFFDE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  bbHeaderText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: '#000',
    fontFamily: fonts.bold,
  },
  bellBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellBadgeText: {
    fontSize: 8,
    color: '#FFF',
    fontWeight: '700',
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    fontFamily: fonts.bold,
  },
  seeAll: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '600',
    fontFamily: fonts.semiBold,
  },

  // Pagination
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E0E0E0',
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 18,
  },

  // User Badge
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  userBadgeText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: '600',
  },

  // ── Section 1: Recent Barters ──
  recentCarousel: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  recentCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  recentCardImage: {
    height: 120,
    backgroundColor: '#F0F7F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // (recentCardEmoji removed - using AppImage)
  recentTimeBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  recentTimeText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: '600',
  },
  recentCardBody: {
    padding: spacing.sm,
  },
  recentName: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
    fontFamily: fonts.bold,
  },
  recentSkill: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
    fontFamily: fonts.regular,
  },

  // ── Section 2: Popular Services ──
  popularRow: {
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  popularCard: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  popularIcon: {
    width: 90,
    height: 90,
    borderRadius: borderRadius.md,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  popularOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderBottomLeftRadius: borderRadius.md,
    borderBottomRightRadius: borderRadius.md,
  },
  popularOverlayText: {
    position: 'absolute',
    bottom: 6,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
    fontFamily: fonts.semiBold,
  },

  // ── Grid Cards (Sections 3, 5, 6, 7) ──
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    gap: 4,
  },
  gridCard: {
    backgroundColor: colors.white,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  gridCardImage: {
    height: 140,
    backgroundColor: '#F0F7F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridCardGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '30%',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  gridBadgePosition: {
    position: 'absolute',
    top: 6,
    left: 6,
  },
  gridBadgeRight: {
    position: 'absolute',
    bottom: 6,
    right: 6,
  },
  heartIcon: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridCardBody: {
    padding: 6,
  },
  gridCardSkill: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 15,
    fontFamily: fonts.bold,
  },
  gridCardLocation: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
    fontFamily: fonts.regular,
  },
  gridCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  gridAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridAvatarText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  gridRating: {
    fontSize: 11,
    color: colors.text,
    fontWeight: '600',
    fontFamily: fonts.semiBold,
  },

  // ── Section 4: Recommended ──
  recommendedCarousel: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  recommendedCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  recommendedImage: {
    height: 280,
    backgroundColor: '#F0F7F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recommendedGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  recommendedOverlayInfo: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    right: 16,
    gap: 2,
  },
  recommendedBadgePos: {
    position: 'absolute',
    top: 14,
    left: 14,
  },
  recommendedHeart: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recommendedCategory: {
    fontSize: fontSize.xs,
    color: '#80DEEA',
    fontWeight: '600',
    fontFamily: fonts.semiBold,
  },
  recommendedName: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: '#FFF',
    fontFamily: fonts.bold,
  },
  recommendedLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  recommendedLocation: {
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: fonts.regular,
  },
  recommendedRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  recommendedRating: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: '#FFF',
    fontFamily: fonts.semiBold,
  },
});
