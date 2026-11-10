import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { PROVIDERS as GLOBAL_PROVIDERS } from '../../data/providers';
import { colors, spacing, fontSize, borderRadius } from '../../theme';
import FilterBottomSheet from '../../components/FilterBottomSheet';
import AppImage from '../../components/AppImage';
import { getCategoryImage, getProviderAvatar, CONTACT_AVATARS } from '../../constants/images';

type Props = NativeStackScreenProps<RootStackParamList, 'CategoryDetail'>;
type UserType = 'Individual' | 'Business' | 'Student';

type CatProvider = {
  id: string;
  icon: string;
  name: string;
  userType: UserType;
  rating: number;
  description: string;
};

const BADGE_COLORS: Record<UserType, string> = {
  Individual: '#00BCD4',
  Business: '#FF6B6B',
  Student: '#FFD700',
};
const BADGE_TEXT_COLORS: Record<UserType, string> = {
  Individual: '#FFF',
  Business: '#FFF',
  Student: '#000',
};
const BADGE_ICONS: Record<UserType, keyof typeof Ionicons.glyphMap> = {
  Individual: 'person',
  Business: 'business',
  Student: 'school',
};

// ── Per-category sample data ───────────────────────────────
const CATEGORY_DATA: Record<string, CatProvider[]> = {
  Photography: [
    { id: 'p1', icon: '📸', name: 'Robert Fox', userType: 'Individual', rating: 4.5, description: 'Photography. Videography. Motion Graphics' },
    { id: 'p2', icon: '📸', name: 'Kathryn Murphy', userType: 'Student', rating: 4.5, description: 'Photography. Videography. Motion Graphics' },
    { id: 'p3', icon: '📸', name: 'Floyd Miles', userType: 'Business', rating: 4.5, description: 'Photography. Videography. Motion Graphics' },
    { id: 'p4', icon: '📸', name: 'Darrell Steward', userType: 'Individual', rating: 4.5, description: 'Photography. Videography. Motion Graphics' },
    { id: 'p5', icon: '📸', name: 'Marvin McKinney', userType: 'Business', rating: 4.5, description: 'Photography. Videography. Motion Graphics' },
    { id: '3', icon: '📸', name: 'Jordan K.', userType: 'Individual', rating: 4.7, description: 'Portrait, event, and brand photography' },
    { id: 'p7', icon: '📸', name: 'Sofia Chen', userType: 'Business', rating: 4.8, description: 'Commercial photography and video production' },
    { id: 'p8', icon: '📸', name: 'Aaliyah R.', userType: 'Individual', rating: 4.9, description: 'Headshots, natural light, lifestyle photography' },
  ],
  Fitness: [
    { id: '1', icon: '💪', name: 'Marcus T.', userType: 'Individual', rating: 4.9, description: 'Personal training, workout plans, nutrition' },
    { id: 'f2', icon: '💪', name: 'Lisa Park', userType: 'Business', rating: 4.7, description: 'Yoga, pilates, and group fitness classes' },
    { id: 'f3', icon: '💪', name: 'Derek James', userType: 'Individual', rating: 4.8, description: 'CrossFit coaching and strength training' },
    { id: 'f4', icon: '💪', name: 'Nina Williams', userType: 'Student', rating: 4.6, description: 'Running coaching and marathon prep' },
    { id: 'f5', icon: '💪', name: 'Troy Bennett', userType: 'Business', rating: 4.9, description: 'Boxing, MMA, and self-defense training' },
    { id: 'f6', icon: '💪', name: 'Mia Santos', userType: 'Individual', rating: 4.5, description: 'Dance fitness and Zumba instruction' },
  ],
  'Hair & Beauty': [
    { id: '2', icon: '💇', name: 'Aaliyah R.', userType: 'Business', rating: 4.8, description: 'Natural hair, braids, locs, protective styles' },
    { id: 'h2', icon: '💇', name: 'Carmen Diaz', userType: 'Individual', rating: 4.7, description: 'Haircuts, coloring, and styling' },
    { id: 'h3', icon: '💇', name: 'Jasmine Lee', userType: 'Business', rating: 4.9, description: 'Makeup artistry and bridal packages' },
    { id: 'h4', icon: '💇', name: 'Tanya Moore', userType: 'Individual', rating: 4.6, description: 'Nail art, manicures, and pedicures' },
    { id: 'h5', icon: '💇', name: 'Rachel Kim', userType: 'Student', rating: 4.5, description: 'Skincare consultations and facials' },
  ],
  Design: [
    { id: '4', icon: '🎨', name: 'Sofia M.', userType: 'Student', rating: 5.0, description: 'Logo, brand identity, and pitch decks' },
    { id: 'd2', icon: '🎨', name: 'Alex Turner', userType: 'Individual', rating: 4.8, description: 'UI/UX design and prototyping' },
    { id: 'd3', icon: '🎨', name: 'Riley Kim', userType: 'Business', rating: 4.7, description: 'Illustration, motion graphics, video editing' },
    { id: 'd4', icon: '🎨', name: 'Nova Chen', userType: 'Individual', rating: 4.9, description: 'Social media graphics and templates' },
    { id: 'd5', icon: '🎨', name: 'Kai Patel', userType: 'Student', rating: 4.6, description: 'Print design, packaging, and merchandise' },
  ],
  Legal: [
    { id: 'l1', icon: '⚖️', name: 'Casey Nguyen', userType: 'Business', rating: 4.9, description: 'Tax prep, contract review, notary' },
    { id: 'l2', icon: '⚖️', name: 'Michael Ross', userType: 'Individual', rating: 4.8, description: 'Small business legal consultation' },
    { id: 'l3', icon: '⚖️', name: 'Diana Prince', userType: 'Business', rating: 4.7, description: 'Real estate and tenant law advice' },
    { id: 'l4', icon: '⚖️', name: 'James Hart', userType: 'Individual', rating: 4.6, description: 'Financial planning and budgeting' },
  ],
  Cooking: [
    { id: '7', icon: '👨‍🍳', name: 'Carlos V.', userType: 'Business', rating: 4.8, description: 'Meal prep, dinner parties, cooking lessons' },
    { id: 'c2', icon: '👨‍🍳', name: 'Maria Lopez', userType: 'Individual', rating: 4.9, description: 'Latin cuisine and baking classes' },
    { id: 'c3', icon: '👨‍🍳', name: 'Kenji Tanaka', userType: 'Business', rating: 4.7, description: 'Sushi and Japanese cuisine classes' },
    { id: 'c4', icon: '👨‍🍳', name: 'Sarah Wells', userType: 'Student', rating: 4.5, description: 'Vegan and plant-based meal prep' },
  ],
  'Product Dev': [
    { id: 'pd1', icon: '💻', name: 'Tyler Grant', userType: 'Individual', rating: 4.8, description: 'Full-stack web development, React, Node' },
    { id: 'pd2', icon: '💻', name: 'Ava Mitchell', userType: 'Business', rating: 4.9, description: 'Mobile app development, iOS and Android' },
    { id: 'pd3', icon: '💻', name: 'Raj Patel', userType: 'Student', rating: 4.6, description: 'WordPress, Shopify, and e-commerce' },
    { id: 'pd4', icon: '💻', name: 'Emma Clark', userType: 'Individual', rating: 4.7, description: 'Landing pages and small business sites' },
  ],
  Podcasting: [
    { id: 'po1', icon: '🎙️', name: 'Dwayne Harris', userType: 'Individual', rating: 4.7, description: 'Podcast editing, mixing, and mastering' },
    { id: 'po2', icon: '🎙️', name: 'Luna Rodriguez', userType: 'Business', rating: 4.8, description: 'Podcast strategy and production' },
    { id: 'po3', icon: '🎙️', name: 'Sam Okeke', userType: 'Student', rating: 4.5, description: 'Audio engineering and sound design' },
    { id: 'po4', icon: '🎙️', name: 'Jackie Fong', userType: 'Individual', rating: 4.6, description: 'Voiceover and narration services' },
  ],
  Music: [
    { id: 'm1', icon: '🎵', name: 'Jamie Torres', userType: 'Individual', rating: 4.8, description: 'Guitar, piano, drums, and vocals' },
    { id: 'm2', icon: '🎵', name: 'Chloe Adams', userType: 'Student', rating: 4.7, description: 'Music production and beat making' },
    { id: 'm3', icon: '🎵', name: 'Marcus Bell', userType: 'Business', rating: 4.9, description: 'Voice lessons and vocal coaching' },
    { id: 'm4', icon: '🎵', name: 'Yuki Sato', userType: 'Individual', rating: 4.6, description: 'Piano lessons for all ages' },
  ],
};

// Fallback: generate providers for unmapped categories
function getProviders(category: string): CatProvider[] {
  if (CATEGORY_DATA[category]) return CATEGORY_DATA[category];
  // Try to find a matching global provider
  const matching = GLOBAL_PROVIDERS.filter((p) =>
    p.skill.toLowerCase().includes(category.toLowerCase()),
  ).map((p) => ({
    id: p.id,
    icon: p.icon,
    name: p.name,
    userType: p.userType as UserType,
    rating: p.rating,
    description: p.offer.slice(0, 60),
  }));
  if (matching.length > 0) return matching;
  // Generic fallback
  return [
    { id: 'g1', icon: '🤝', name: 'Alex Johnson', userType: 'Individual' as UserType, rating: 4.7, description: `Professional ${category} services` },
    { id: 'g2', icon: '🤝', name: 'Morgan Davis', userType: 'Business' as UserType, rating: 4.8, description: `Expert ${category} provider` },
    { id: 'g3', icon: '🤝', name: 'Chris Lee', userType: 'Student' as UserType, rating: 4.5, description: `Affordable ${category} services` },
    { id: 'g4', icon: '🤝', name: 'Jordan Smith', userType: 'Individual' as UserType, rating: 4.6, description: `${category} specialist` },
  ];
}

// ── Screen ─────────────────────────────────────────────────
export default function CategoryDetailScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { categoryName } = route.params;
  const providers = getProviders(categoryName);
  const [showFilter, setShowFilter] = useState(false);

  function openProvider(provider: CatProvider) {
    // If it's a global provider, open their detail page
    const globalProvider = GLOBAL_PROVIDERS.find((p) => p.id === provider.id);
    if (globalProvider) {
      navigation.navigate('ProviderDetail', { providerId: provider.id });
    } else {
      navigation.navigate('BarterRequest', {
        providerName: provider.name,
        serviceName: categoryName,
        serviceIcon: provider.icon,
        serviceCategory: categoryName,
      });
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{categoryName}</Text>
        <TouchableOpacity>
          <Ionicons name="search" size={22} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        <TouchableOpacity style={styles.filterPill} onPress={() => setShowFilter(true)}>
          <Ionicons name="options" size={16} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterPill}>
          <Text style={styles.filterText}>Pricing</Text>
          <Ionicons name="chevron-down" size={14} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Provider List */}
      <FlatList
        data={providers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} activeOpacity={0.7} onPress={() => openProvider(item)}>
            {/* Image */}
            <View style={styles.rowImage}>
              <AppImage uri={getCategoryImage(categoryName)} width={120} height={120} borderRadius={12} fallbackText={item.name} />
              <View style={[styles.rowBadge, { backgroundColor: BADGE_COLORS[item.userType] }]}>
                <Ionicons name={BADGE_ICONS[item.userType]} size={9} color={BADGE_TEXT_COLORS[item.userType]} />
                <Text style={[styles.rowBadgeText, { color: BADGE_TEXT_COLORS[item.userType] }]}>{item.userType}</Text>
              </View>
            </View>

            {/* Info */}
            <View style={styles.rowInfo}>
              <View style={styles.rowNameRow}>
                <AppImage
                  uri={getProviderAvatar(item.id) || CONTACT_AVATARS[item.name] || 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?w=100&h=100&fit=crop'}
                  width={36}
                  height={36}
                  borderRadius={18}
                  fallbackText={item.name}
                />
                <Text style={styles.rowName}>{item.name}</Text>
              </View>
              <View style={styles.categoryTag}>
                <Text style={styles.categoryTagText}>{categoryName}</Text>
              </View>
              <Text style={styles.rowDesc} numberOfLines={2}>{item.description}</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={13} color="#FFD700" />
                <Text style={styles.ratingText}>{item.rating}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
      <FilterBottomSheet visible={showFilter} onClose={() => setShowFilter(false)} onApply={() => {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: 12 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#000' },
  filterRow: { flexDirection: 'row', paddingHorizontal: spacing.md, gap: 8, marginBottom: 8 },
  filterPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#E0E0E0' },
  filterText: { fontSize: fontSize.sm, color: '#000' },
  list: { paddingHorizontal: spacing.md, paddingBottom: 100 },
  separator: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 6 },
  row: { flexDirection: 'row', gap: 12, paddingVertical: 6 },
  rowImage: { width: 120, height: 120, borderRadius: 12, backgroundColor: '#F0F7F8', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  rowImageEmoji: { fontSize: 40 },
  rowBadge: { position: 'absolute', bottom: 6, left: 6, flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  rowBadgeText: { fontSize: 9, fontWeight: '600' },
  rowInfo: { flex: 1, gap: 6, justifyContent: 'center' },
  rowNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  rowAvatarText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  rowName: { fontSize: fontSize.md, fontWeight: '700', color: '#000' },
  categoryTag: { backgroundColor: '#F0F0F0', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start' },
  categoryTagText: { fontSize: 11, color: '#999' },
  rowDesc: { fontSize: 13, color: '#999', lineHeight: 18 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 13, fontWeight: '600', color: '#000' },
});
