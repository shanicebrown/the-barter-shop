import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Animated,
  PanResponder,
  Dimensions,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { setStatusBarStyle } from 'expo-status-bar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { PROVIDERS, BADGE_COLORS, BADGE_ICONS, PRE_SEEDED_LIKES, Provider } from '../../data/providers';
import { colors, spacing, fontSize, borderRadius, fonts } from '../../theme';
import AppImage from '../../components/AppImage';
import MembershipBadge from '../../components/MembershipBadge';
import { getProviderPhoto, getProviderAvatar, getCategoryImage } from '../../constants/images';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = 50;
const CARD_WIDTH = SCREEN_WIDTH - 32;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.52;

const CATEGORIES = [
  { name: 'Photography' },
  { name: 'Product Dev' },
  { name: 'Meal Prep' },
  { name: 'Wellness' },
  { name: 'Podcasting' },
  { name: 'Fitness' },
  { name: 'Design' },
  { name: 'Legal' },
];

// ── You Liked Popup ────────────────────────────────────────
function YouLikedPopup({ provider, onDismiss }: { provider: Provider; onDismiss: () => void }) {
  return (
    <Modal transparent animationType="fade">
      <View style={popupStyles.overlay}>
        <View style={popupStyles.card}>
          <View style={popupStyles.photoBox}>
            <AppImage uri={getProviderPhoto(provider.id)} width={280} height={160} fallbackText={provider.name} />
          </View>
          <View style={popupStyles.heartCircle}>
            <Ionicons name="heart" size={18} color="#FFF" />
          </View>
          <Text style={popupStyles.title}>You liked {provider.name}</Text>
          <Text style={popupStyles.subtitle}>Get started! If they like you back then it's a match!</Text>
          <TouchableOpacity style={popupStyles.gotItBtn} onPress={onDismiss}>
            <Text style={popupStyles.gotItText}>Got it</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const popupStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 32 },
  card: { backgroundColor: '#FFF', borderRadius: 24, padding: 24, alignItems: 'center', width: '100%' },
  photoBox: { width: '100%', height: 160, backgroundColor: '#2A3040', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: -20 },
  photoEmoji: { fontSize: 64 },
  heartCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FF6B6B', justifyContent: 'center', alignItems: 'center', marginBottom: 12, zIndex: 1 },
  title: { fontSize: 20, fontWeight: '700', color: '#000', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#999', textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  gotItBtn: { backgroundColor: colors.primary, paddingVertical: 12, borderRadius: 12, alignItems: 'center', width: '100%' },
  gotItText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});

// ── It's a Match Screen ────────────────────────────────────
function ItsAMatchScreen({ provider, onChat, onBarter }: { provider: Provider; onChat: () => void; onBarter: () => void }) {
  return (
    <View style={matchStyles.container}>
      {/* Top half: split photos */}
      <View style={matchStyles.photoSplit}>
        <View style={matchStyles.photoLeft}>
          <AppImage uri={getProviderPhoto(provider.id)} width={SCREEN_WIDTH / 2} height={SCREEN_HEIGHT * 0.5} fallbackText={provider.name} />
          <View style={matchStyles.photoOverlay}>
            <View style={[matchStyles.badge, { backgroundColor: BADGE_COLORS[provider.userType] }]}>
              <Text style={matchStyles.badgeText}>{provider.userType}</Text>
            </View>
            <View style={matchStyles.photoAvatarRow}>
              <AppImage uri={getProviderAvatar(provider.id)} width={24} height={24} borderRadius={12} fallbackText={provider.name} />
              <Text style={matchStyles.photoName}>{provider.name}</Text>
            </View>
          </View>
        </View>
        <View style={matchStyles.photoRight}>
          <AppImage uri="https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?w=400&h=400&fit=crop" width={SCREEN_WIDTH / 2} height={SCREEN_HEIGHT * 0.5} fallbackText="Y" />
          <View style={matchStyles.photoOverlay}>
            <View style={[matchStyles.badge, { backgroundColor: '#2196F3' }]}>
              <Text style={matchStyles.badgeText}>Individual</Text>
            </View>
            <View style={matchStyles.photoAvatarRow}>
              <View style={matchStyles.photoSmallAvatar}><Text style={{ color: '#FFF', fontSize: 12, fontWeight: '700' }}>Y</Text></View>
              <Text style={matchStyles.photoName}>You</Text>
            </View>
          </View>
        </View>
        <View style={matchStyles.matchTextOverlay}>
          <Text style={matchStyles.itsA}>IT'S A</Text>
          <Text style={matchStyles.matchWord}>MATCH!</Text>
        </View>
      </View>

      {/* Bottom half */}
      <View style={matchStyles.bottomHalf}>
        <Text style={matchStyles.possibleTrade}>Possible Trade</Text>
        <Text style={matchStyles.tradeDescription}>{provider.skill} for Fitness Training!</Text>
        <View style={matchStyles.buttonsRow}>
          <TouchableOpacity style={matchStyles.chatBtn} onPress={onChat}>
            <Text style={matchStyles.chatBtnText}>Let's chat</Text>
          </TouchableOpacity>
          <TouchableOpacity style={matchStyles.barterBtn} onPress={onBarter}>
            <Text style={matchStyles.barterBtnText}>Barter Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const matchStyles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFillObject, zIndex: 200, backgroundColor: '#FFF' },
  photoSplit: { flex: 1, flexDirection: 'row' },
  photoLeft: { flex: 1, backgroundColor: '#2A3040', justifyContent: 'center', alignItems: 'center' },
  photoRight: { flex: 1, backgroundColor: '#3A4050', justifyContent: 'center', alignItems: 'center' },
  photoEmoji: { fontSize: 60 },
  photoOverlay: { position: 'absolute', bottom: 16, left: 12, gap: 6 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start' },
  badgeText: { color: '#FFF', fontSize: 9, fontWeight: '600' },
  photoAvatarRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  photoSmallAvatar: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  photoName: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  matchTextOverlay: { position: 'absolute', alignSelf: 'center', top: '40%', alignItems: 'center', zIndex: 10 },
  itsA: { fontSize: 22, fontWeight: '900', color: '#FFF' },
  matchWord: { fontSize: 38, fontWeight: '900', color: colors.primary },
  bottomHalf: { backgroundColor: '#FFFDE7', padding: 24, alignItems: 'center', gap: 12 },
  possibleTrade: { fontSize: 16, color: '#000' },
  tradeDescription: { fontSize: 22, fontWeight: '700', color: '#FF6B6B', textAlign: 'center' },
  buttonsRow: { flexDirection: 'row', gap: 12, marginTop: 12, width: '100%' },
  chatBtn: { flex: 1, borderWidth: 1, borderColor: '#E0E0E0', paddingVertical: 14, borderRadius: 12, alignItems: 'center', backgroundColor: '#FFF' },
  chatBtnText: { fontSize: 15, fontWeight: '600', color: '#000' },
  barterBtn: { flex: 1, backgroundColor: '#FFD700', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  barterBtnText: { fontSize: 15, fontWeight: '600', color: '#000' },
});

// ── Swipe Card ─────────────────────────────────────────────
function SwipeCard({ provider, onTap }: { provider: Provider; onTap: () => void }) {
  return (
    <TouchableWithoutFeedback onPress={onTap}>
      <View style={styles.card}>
        <View style={styles.cardPhoto}>
          <AppImage uri={getProviderPhoto(provider.id)} width={CARD_WIDTH} height={CARD_HEIGHT} fallbackText={provider.name} />
        </View>
        <View style={styles.cardInfo}>
          <View style={[styles.userBadge, { backgroundColor: BADGE_COLORS[provider.userType] + 'DD' }]}>
            <Ionicons name={BADGE_ICONS[provider.userType]} size={10} color="#FFF" />
            <Text style={styles.userBadgeText}>{provider.userType}</Text>
          </View>
          <View style={styles.cardNameRow}>
            <View style={styles.cardAvatar}>
              <AppImage uri={getProviderAvatar(provider.id)} width={32} height={32} borderRadius={16} fallbackText={provider.name} />
            </View>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.cardName}>{provider.name}</Text>
                <MembershipBadge status="unverified" size={24} />
              </View>
              <Text style={styles.cardSkill}>{provider.skill}</Text>
            </View>
          </View>
          <View style={styles.cardLocationRow}>
            <Ionicons name="location" size={13} color="#AAA" />
            <Text style={styles.cardLocation}>{provider.zip}, {provider.city}, {provider.state} | {provider.distance}</Text>
          </View>
          <View style={styles.cardRatingRow}>
            <Ionicons name="star" size={13} color="#FFD700" />
            <Text style={styles.cardRating}>{provider.rating}</Text>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

// ── Main Screen ────────────────────────────────────────────
export default function MatchScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedProvider, setLikedProvider] = useState<Provider | null>(null);
  const [matchedProvider, setMatchedProvider] = useState<Provider | null>(null);
  const position = useRef(new Animated.ValueXY()).current;

  useFocusEffect(useCallback(() => {
    setStatusBarStyle('light');
    return () => setStatusBarStyle('dark');
  }, []));

  const currentProvider = PROVIDERS[currentIndex];
  const nextProvider = PROVIDERS[currentIndex + 1];
  const isDone = currentIndex >= PROVIDERS.length;

  const animateOff = useCallback((direction: number, cb: () => void) => {
    Animated.timing(position, { toValue: { x: direction * SCREEN_WIDTH * 1.5, y: 0 }, duration: 300, useNativeDriver: false }).start(() => {
      position.setValue({ x: 0, y: 0 });
      cb();
    });
  }, [position]);

  const advance = useCallback(() => setCurrentIndex((i) => i + 1), []);

  const handleLike = useCallback(() => {
    if (!currentProvider) return;
    const provider = currentProvider;
    animateOff(1, () => {
      advance();
      if (PRE_SEEDED_LIKES.has(provider.id)) {
        setMatchedProvider(provider);
      } else {
        setLikedProvider(provider);
      }
    });
  }, [currentProvider, animateOff, advance]);

  const handleNope = useCallback(() => { animateOff(-1, advance); }, [animateOff, advance]);

  const handleBarterButton = useCallback(() => {
    if (!currentProvider) return;
    navigation.navigate('BarterRequest', {
      providerName: currentProvider.name, serviceName: currentProvider.skill,
      serviceIcon: currentProvider.icon, serviceCategory: currentProvider.skill,
    });
  }, [currentProvider, navigation]);

  const handleCardTap = useCallback(() => {
    if (!currentProvider) return;
    navigation.navigate('ProviderDetail', { providerId: currentProvider.id });
  }, [currentProvider, navigation]);

  const handleMatchChat = useCallback(() => {
    if (!matchedProvider) return;
    const p = matchedProvider;
    setMatchedProvider(null);
    navigation.navigate('Conversation', { providerId: p.id, providerName: p.name, providerIcon: p.icon });
  }, [matchedProvider, navigation]);

  const handleMatchBarter = useCallback(() => {
    if (!matchedProvider) return;
    const p = matchedProvider;
    setMatchedProvider(null);
    navigation.navigate('BarterFlow', {
      providerName: p.name, providerIcon: p.icon, providerService: p.skill,
      providerValue: 500, userService: 'Fitness Training', userValue: 300,
    });
  }, [matchedProvider, navigation]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 5,
      onPanResponderMove: (_, g) => { position.setValue({ x: g.dx, y: 0 }); },
      onPanResponderRelease: (_, g) => {
        if (g.dx > SWIPE_THRESHOLD) handleLike();
        else if (g.dx < -SWIPE_THRESHOLD) handleNope();
        else Animated.spring(position, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
      },
    })
  ).current;

  const rotate = position.x.interpolate({ inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH], outputRange: ['-15deg', '0deg', '15deg'] });
  const likeOpacity = position.x.interpolate({ inputRange: [0, SWIPE_THRESHOLD], outputRange: [0, 1], extrapolate: 'clamp' });
  const nopeOpacity = position.x.interpolate({ inputRange: [-SWIPE_THRESHOLD, 0], outputRange: [1, 0], extrapolate: 'clamp' });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Match</Text>
        <TouchableOpacity><Ionicons name="options" size={22} color="#FFF" /></TouchableOpacity>
      </View>

      <View style={styles.categoryStrip}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity key={cat.name} style={styles.categoryItem}>
              <View style={styles.categoryThumb}>
                <AppImage uri={getCategoryImage(cat.name)} width={50} height={50} borderRadius={borderRadius.md} fallbackText={cat.name} />
              </View>
              <Text style={styles.categoryLabel}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.cardStack}>
        {isDone ? (
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 48 }}>🔍</Text>
            <Text style={styles.emptyTitle}>No more matches</Text>
            <Text style={styles.emptyText}>Check back later for new providers</Text>
            <TouchableOpacity style={styles.resetButton} onPress={() => setCurrentIndex(0)}>
              <Text style={styles.resetButtonText}>Start Over</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {nextProvider && (
              <View style={[styles.cardContainer, styles.cardBehind]}>
                <SwipeCard provider={nextProvider} onTap={() => {}} />
              </View>
            )}
            {currentProvider && (
              <Animated.View style={[styles.cardContainer, { transform: [{ translateX: position.x }, { rotate }] }]} {...panResponder.panHandlers}>
                <Animated.View style={[styles.stamp, styles.stampLike, { opacity: likeOpacity }]}><Text style={styles.stampLikeText}>LIKE</Text></Animated.View>
                <Animated.View style={[styles.stamp, styles.stampNope, { opacity: nopeOpacity }]}><Text style={styles.stampNopeText}>NOPE</Text></Animated.View>
                <SwipeCard provider={currentProvider} onTap={handleCardTap} />
              </Animated.View>
            )}
          </>
        )}
      </View>

      {!isDone && currentProvider && (
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionNope} onPress={handleNope}><Ionicons name="close" size={28} color="#FFF" /></TouchableOpacity>
          <TouchableOpacity style={styles.actionBarter} onPress={handleBarterButton}><Ionicons name="swap-horizontal" size={30} color="#1A1A1A" /></TouchableOpacity>
          <TouchableOpacity style={styles.actionHeart} onPress={handleLike}><Ionicons name="heart" size={24} color="#FFF" /></TouchableOpacity>
        </View>
      )}

      {/* Popups */}
      {likedProvider && <YouLikedPopup provider={likedProvider} onDismiss={() => setLikedProvider(null)} />}
      {matchedProvider && <ItsAMatchScreen provider={matchedProvider} onChat={handleMatchChat} onBarter={handleMatchBarter} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  headerTitle: { fontSize: fontSize.xl, fontWeight: '700', color: '#FFF', fontFamily: fonts.extraBold },
  categoryStrip: { backgroundColor: '#004D5A', height: 90, justifyContent: 'center' },
  categoryScroll: { paddingHorizontal: 12, gap: 12, alignItems: 'center' },
  categoryItem: { alignItems: 'center', gap: 4 },
  categoryThumb: { width: 50, height: 50, borderRadius: borderRadius.md, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  categoryLabel: { color: '#FFF', fontSize: 11, fontFamily: fonts.semiBold },
  cardStack: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.md },
  cardContainer: { position: 'absolute', width: CARD_WIDTH, height: CARD_HEIGHT },
  cardBehind: { top: 8, transform: [{ scale: 0.95 }] },
  stamp: { position: 'absolute', zIndex: 10, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 3, borderRadius: borderRadius.md },
  stampLike: { top: 40, left: 24, borderColor: colors.primary, transform: [{ rotate: '-15deg' }] },
  stampLikeText: { fontSize: fontSize.xxl, fontWeight: '900', color: colors.primary, fontFamily: fonts.black },
  stampNope: { top: 40, right: 24, borderColor: '#FF4458', transform: [{ rotate: '15deg' }] },
  stampNopeText: { fontSize: fontSize.xxl, fontWeight: '900', color: '#FF4458', fontFamily: fonts.black },
  card: { flex: 1, borderRadius: borderRadius.xl, overflow: 'hidden', backgroundColor: '#1E1E1E' },
  cardPhoto: { flex: 1, backgroundColor: '#2A3040', justifyContent: 'center', alignItems: 'center' },
  cardPhotoEmoji: { fontSize: 80 },
  cardInfo: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing.md, backgroundColor: 'rgba(0,0,0,0.7)', gap: 6 },
  userBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 3, borderRadius: borderRadius.sm, alignSelf: 'flex-start' },
  userBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '600' },
  cardNameRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardAvatar: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: colors.primary, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' },
  cardAvatarEmoji: { fontSize: 18 },
  cardName: { fontSize: fontSize.lg, fontWeight: '700', color: '#FFF', fontFamily: fonts.bold },
  cardSkill: { fontSize: fontSize.sm, color: '#CCC', fontFamily: fonts.regular },
  cardLocationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardLocation: { fontSize: 13, color: '#AAA', fontFamily: fonts.regular },
  cardRatingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardRating: { fontSize: 13, fontWeight: '600', color: '#FFD700', fontFamily: fonts.semiBold },
  actionRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 24, paddingBottom: spacing.lg, paddingTop: spacing.sm },
  actionNope: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#2A2A2A', justifyContent: 'center', alignItems: 'center' },
  actionBarter: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FFD700', justifyContent: 'center', alignItems: 'center' },
  actionHeart: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#FF6B6B', justifyContent: 'center', alignItems: 'center' },
  emptyState: { alignItems: 'center', gap: spacing.md },
  emptyTitle: { fontSize: fontSize.xl, fontWeight: 'bold', color: '#FFF' },
  emptyText: { fontSize: fontSize.md, color: '#888' },
  resetButton: { backgroundColor: colors.primary, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: borderRadius.lg, marginTop: spacing.sm },
  resetButtonText: { color: '#FFF', fontSize: fontSize.md, fontWeight: '600' },
});
