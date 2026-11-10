import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { PROVIDERS, BADGE_COLORS, BADGE_ICONS } from '../../data/providers';
import { supabase } from '../../config/supabase';
import { colors, spacing, fontSize, borderRadius, fonts } from '../../theme';
import AppImage from '../../components/AppImage';
import MembershipBadge from '../../components/MembershipBadge';
import { getProviderAvatar } from '../../constants/images';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const HERO_HEIGHT = SCREEN_HEIGHT * 0.45;

type Props = NativeStackScreenProps<RootStackParamList, 'ProviderDetail'>;

export default function ProviderDetailScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const provider = PROVIDERS.find((p) => p.id === route.params.providerId);
  const [liked, setLiked] = useState(false);
  const [passed, setPassed] = useState(false);
  const [showMatch, setShowMatch] = useState(false);
  const heartScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!provider) return;
    checkInteractionState();
  }, [provider]);

  async function checkInteractionState() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !provider) return;

      const { data } = await supabase
        .from('likes')
        .select('id, is_pass')
        .eq('liker_id', user.id)
        .eq('liked_id', provider.id)
        .maybeSingle();

      if (data) {
        if (data.is_pass) setPassed(true);
        else setLiked(true);
      }
    } catch (e) {
      console.log('Check interaction error:', e);
    }
  }

  async function handleLike() {
    if (liked || !provider) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('likes').upsert({
        liker_id: user.id,
        liked_id: provider.id,
        is_pass: false,
      }, { onConflict: 'liker_id,liked_id' });

      setLiked(true);
      Animated.sequence([
        Animated.timing(heartScale, { toValue: 1.4, duration: 150, useNativeDriver: true }),
        Animated.timing(heartScale, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();

      // Check mutual match
      const { data: mutual } = await supabase
        .from('likes')
        .select('id')
        .eq('liker_id', provider.id)
        .eq('liked_id', user.id)
        .eq('is_pass', false)
        .maybeSingle();

      if (mutual) {
        setShowMatch(true);
      }

      // Notify liked user
      try {
        await supabase.from('notifications').insert({
          user_id: provider.id,
          title: 'Someone liked you!',
          message: 'Check out who is interested in bartering with you.',
          type: 'new_match',
          related_id: user.id,
        });
      } catch {} // Non-critical
    } catch (e) {
      console.log('Like error:', e);
    }
  }

  async function handleDislike() {
    if (passed || !provider) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('likes').upsert({
        liker_id: user.id,
        liked_id: provider.id,
        is_pass: true,
      }, { onConflict: 'liker_id,liked_id' });

      setPassed(true);
    } catch (e) {
      console.log('Dislike error:', e);
    }
  }

  function handleBarter() {
    if (!provider) return;
    navigation.navigate('BarterRequest', {
      providerName: provider.name,
      serviceName: provider.skill,
      serviceIcon: provider.icon,
      serviceCategory: provider.skill,
    });
  }

  function handleMatchChat() {
    if (!provider) return;
    setShowMatch(false);
    navigation.navigate('Conversation', {
      providerId: provider.id,
      providerName: provider.name,
      providerIcon: provider.icon,
    });
  }

  if (!provider) {
    return (
      <View style={styles.container}>
        <Text style={{ color: '#000', textAlign: 'center', marginTop: 100 }}>Provider not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.hero}>
          <AppImage uri={provider.photo} width={SCREEN_WIDTH} height={HERO_HEIGHT} fallbackText={provider.name} />
          <View style={styles.heroGradient} />
        </View>

        {/* Provider Info */}
        <View style={styles.infoSection}>
          <View style={[styles.userBadge, { backgroundColor: BADGE_COLORS[provider.userType] }]}>
            <Ionicons name={BADGE_ICONS[provider.userType]} size={11} color="#FFF" />
            <Text style={styles.userBadgeText}>{provider.userType}</Text>
          </View>

          <View style={styles.nameRow}>
            <View style={styles.avatar}>
              <AppImage uri={provider.avatar} width={44} height={44} borderRadius={22} fallbackText={provider.name} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={styles.providerName}>{provider.name}</Text>
                <MembershipBadge status="unverified" size={28} />
              </View>
              <Text style={styles.providerSkill}>{provider.skill}</Text>
            </View>
          </View>

          <View style={styles.locationRow}>
            <Ionicons name="location" size={14} color={colors.textMuted} />
            <Text style={styles.locationText}>
              {provider.zip}, {provider.city}, {provider.state} | <Text style={styles.locationBold}>{provider.distance}</Text>
            </Text>
          </View>

          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.ratingText}>{provider.rating}</Text>
          </View>
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.detailTitle}>What I can offer:</Text>
          <Text style={styles.detailBody}>{provider.offer}</Text>
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.detailTitle}>What I am looking for:</Text>
          <Text style={styles.detailBody}>{provider.lookingFor}</Text>
        </View>

        <View style={{ height: 150 + insets.bottom }} />
      </ScrollView>

      <TouchableOpacity
        style={[styles.backButton, { top: insets.top + 8 }]}
        onPress={() => navigation.goBack()}
        hitSlop={8}
        accessibilityLabel="Back"
      >
        <Ionicons name="arrow-back" size={22} color="#FFF" />
      </TouchableOpacity>

      {/* Action Bar — fixed at bottom */}
      <View style={[styles.actionBar, { paddingBottom: insets.bottom || 24 }]}>
        <TouchableOpacity
          style={[styles.actionButton, passed && styles.passedButton]}
          onPress={handleDislike}
          disabled={passed}
        >
          <Ionicons name="close" size={24} color={passed ? '#666' : '#FFF'} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButtonCenter} onPress={handleBarter}>
          <Ionicons name="swap-horizontal" size={32} color="#FFF" />
        </TouchableOpacity>

        <Animated.View style={{ transform: [{ scale: heartScale }] }}>
          <TouchableOpacity
            style={[styles.actionButton, liked && styles.likedButton]}
            onPress={handleLike}
            disabled={liked}
          >
            <Ionicons name={liked ? 'heart' : 'heart-outline'} size={24} color={liked ? colors.primary : '#FFF'} />
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Match Modal */}
      <Modal visible={showMatch} transparent animationType="fade">
        <View style={matchStyles.overlay}>
          <View style={matchStyles.card}>
            <View style={matchStyles.avatarRow}>
              <View style={matchStyles.avatarRing}>
                <AppImage uri="https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?w=100&h=100&fit=crop" width={72} height={72} borderRadius={36} fallbackText="Y" />
              </View>
              <View style={matchStyles.avatarRing}>
                <AppImage uri={getProviderAvatar(provider.id)} width={72} height={72} borderRadius={36} fallbackText={provider.name} />
              </View>
            </View>
            <Text style={matchStyles.title}>It's a Match!</Text>
            <Text style={matchStyles.subtitle}>{provider.name} and you both liked each other!</Text>
            <TouchableOpacity style={matchStyles.chatBtn} onPress={handleMatchChat}>
              <Text style={matchStyles.chatBtnText}>Send a Message</Text>
            </TouchableOpacity>
            <TouchableOpacity style={matchStyles.keepBtn} onPress={() => setShowMatch(false)}>
              <Text style={matchStyles.keepBtnText}>Keep Exploring</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const matchStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 32 },
  card: { backgroundColor: '#FFF', borderRadius: 24, padding: 32, alignItems: 'center', width: '100%', gap: 12 },
  avatarRow: { flexDirection: 'row', gap: -12 },
  avatarRing: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: colors.primary, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', shadowColor: colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 12 },
  title: { fontSize: 28, fontWeight: '900', color: '#000', fontFamily: fonts.extraBold },
  subtitle: { fontSize: fontSize.sm, color: '#999', textAlign: 'center', fontFamily: fonts.regular },
  chatBtn: { backgroundColor: colors.primary, width: '100%', height: 52, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  chatBtnText: { color: '#FFF', fontSize: fontSize.md, fontWeight: '700', fontFamily: fonts.bold },
  keepBtn: { borderWidth: 1.5, borderColor: '#E0E0E0', width: '100%', height: 52, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  keepBtnText: { color: '#666', fontSize: fontSize.md, fontFamily: fonts.semiBold },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  hero: { height: HERO_HEIGHT, backgroundColor: '#2A3040' },
  heroGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, backgroundColor: 'transparent', ...({ backgroundImage: 'linear-gradient(transparent, rgba(0,0,0,0.3))' } as any) },
  backButton: { position: 'absolute', left: 16, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },

  infoSection: { padding: spacing.md, paddingTop: spacing.lg, gap: 8 },
  userBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: borderRadius.sm, alignSelf: 'flex-start' },
  userBadgeText: { color: '#FFF', fontSize: 11, fontWeight: '600' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 },
  avatar: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: colors.primary, overflow: 'hidden' },
  providerName: { fontSize: 28, fontWeight: '700', color: '#000', fontFamily: fonts.extraBold },
  providerSkill: { fontSize: fontSize.md, fontWeight: '700', color: '#000', fontFamily: fonts.bold },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: 13, color: colors.textMuted, fontFamily: fonts.regular },
  locationBold: { fontWeight: '700', color: '#000' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 13, fontWeight: '600', color: '#FFD700', fontFamily: fonts.semiBold },

  detailSection: { paddingHorizontal: spacing.md, marginTop: spacing.lg },
  detailTitle: { fontSize: fontSize.lg, fontWeight: '700', color: '#000', marginBottom: spacing.sm, fontFamily: fonts.bold },
  detailBody: { fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 22, fontFamily: fonts.regular },

  // Action Bar
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    paddingVertical: 20,
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  actionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonCenter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  likedButton: {
    backgroundColor: 'rgba(0, 188, 212, 0.2)',
  },
  passedButton: {
    backgroundColor: '#1A1A1A',
    opacity: 0.5,
  },
});
