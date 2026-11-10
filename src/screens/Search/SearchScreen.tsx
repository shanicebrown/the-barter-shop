import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated,
  ActivityIndicator,
} from 'react-native';
import FilterBottomSheet from '../../components/FilterBottomSheet';
import AppImage from '../../components/AppImage';
import { getProviderPhoto, getProviderAvatar } from '../../constants/images';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { setStatusBarStyle } from 'expo-status-bar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Region } from 'react-native-maps';
import { RootStackParamList } from '../../types/navigation';
import { colors, spacing, fontSize, borderRadius, fonts } from '../../theme';
import {
  getUserLocation,
  getNearbyProviders,
  formatDistance,
  geocodeSearch,
  withTimeout,
  NearbyProvider,
} from '../../services/LocationService';
import { PROVIDERS as FALLBACK_PROVIDERS } from '../../data/providers';

type UserType = 'Individual' | 'Business' | 'Student';

const BADGE_COLORS: Record<string, string> = {
  individual: '#00BCD4', business: '#FF6B6B', verified_pro: '#00BCD4',
  Individual: '#00BCD4', Business: '#FF6B6B', Student: '#FFD700',
};
const BADGE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  individual: 'person', business: 'business', verified_pro: 'shield-checkmark',
  Individual: 'person', Business: 'business', Student: 'school',
};

const DENVER_FALLBACK: Region = {
  latitude: 39.7392, longitude: -104.9903,
  latitudeDelta: 0.06, longitudeDelta: 0.06,
};

// Map a fallback provider to display format
function mapFallback(p: typeof FALLBACK_PROVIDERS[0], i: number) {
  return {
    id: p.id, username: p.name, full_name: p.name, avatar_url: null,
    user_type: p.userType.toLowerCase(), verification_status: 'unverified',
    rating: p.rating, barter_count: 10 + i * 5,
    latitude: 39.7392 + (0.009 + i * 0.0028) * Math.cos(i * 2.39996),
    longitude: -104.9903 + (0.009 + i * 0.0028) * 1.3 * Math.sin(i * 2.39996),
    location_city: p.city, location_state: p.state,
    distance: parseFloat(p.distance), services: [{ id: p.id, title: p.skill, category: p.skill, barter_type: 'full', value: 300 }],
  } as NearbyProvider;
}

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const mapRef = useRef<MapView>(null);
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState(false);
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [providers, setProviders] = useState<NearbyProvider[]>([]);
  const [radius, setRadius] = useState(50);
  const [locationLabel, setLocationLabel] = useState('Denver, CO');
  const cardAnim = useRef(new Animated.Value(1)).current;

  useFocusEffect(useCallback(() => {
    setStatusBarStyle('light');
    return () => setStatusBarStyle('dark');
  }, []));

  const selectedProvider = providers.find((p) => p.id === selectedId) || providers[0];

  // Initialize
  useEffect(() => {
    (async () => {
      const loc = await getUserLocation();
      if (loc) {
        setUserCoords({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        setLocationLabel(`${loc.city || 'Your area'}${loc.state ? ', ' + loc.state : ''}`);
        const nearby = (await withTimeout(getNearbyProviders(loc.coords.latitude, loc.coords.longitude, radius), 8000)) ?? [];
        if (nearby.length > 0) {
          setProviders(nearby);
          setSelectedId(nearby[0].id);
        } else {
          // Use fallback data positioned near user
          setProviders(FALLBACK_PROVIDERS.slice(0, 8).map(mapFallback));
          setSelectedId(FALLBACK_PROVIDERS[0].id);
        }
      } else {
        setLocationError(true);
        // Use Denver fallback
        setProviders(FALLBACK_PROVIDERS.slice(0, 8).map(mapFallback));
        setSelectedId(FALLBACK_PROVIDERS[0].id);
      }
      setLoading(false);
    })();
  }, [radius]);

  const handleMarkerPress = useCallback((provider: NearbyProvider) => {
    setSelectedId(provider.id);
    Animated.sequence([
      Animated.timing(cardAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.spring(cardAnim, { toValue: 1, useNativeDriver: true }),
    ]).start();
    mapRef.current?.animateToRegion({
      latitude: provider.latitude, longitude: provider.longitude,
      latitudeDelta: 0.02, longitudeDelta: 0.02,
    }, 300);
  }, [cardAnim]);

  const handlePreviewPress = useCallback(() => {
    if (selectedProvider) {
      navigation.navigate('ProviderDetail', { providerId: selectedProvider.id });
    }
  }, [selectedProvider, navigation]);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    const coords = await geocodeSearch(query.trim());
    if (coords) {
      setUserCoords(coords);
      setLocationLabel(query.trim());
      mapRef.current?.animateToRegion({
        ...coords, latitudeDelta: 0.06, longitudeDelta: 0.06,
      }, 500);
      const nearby = await getNearbyProviders(coords.latitude, coords.longitude, radius);
      if (nearby.length > 0) {
        setProviders(nearby);
        setSelectedId(nearby[0].id);
      }
    }
  }, [query, radius]);

  const handleFilterApply = useCallback((filters: { distance: number }) => {
    setRadius(filters.distance);
  }, []);

  const mapRegion: Region = userCoords
    ? { ...userCoords, latitudeDelta: 0.06, longitudeDelta: 0.06 }
    : DENVER_FALLBACK;

  const providerCount = providers.length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder={`Type your service near ${locationLabel}`}
            placeholderTextColor="#999"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity onPress={handleSearch}>
            <Ionicons name="search" size={20} color="#999" />
          </TouchableOpacity>
        </View>
        <View style={styles.filterRow}>
          <TouchableOpacity style={styles.filterIconPill} onPress={() => setShowFilter(true)}>
            <Ionicons name="options" size={18} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterPill}>
            <Text style={styles.filterPillText}>Service Type</Text>
            <Ionicons name="chevron-down" size={14} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterPill}>
            <Text style={styles.filterPillText}>{radius}km</Text>
            <Ionicons name="chevron-down" size={14} color="#FFF" />
          </TouchableOpacity>
        </View>
        <Text style={styles.countText}>{providerCount} providers within {radius}km</Text>
      </View>

      {/* Map or Loading */}
      {loading ? (
        <View style={styles.loadingView}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Finding barterers near you...</Text>
        </View>
      ) : Platform.OS === 'web' ? (
        <View style={styles.mapFallback}>
          <Ionicons name="map" size={48} color={colors.textMuted} />
          <Text style={styles.mapFallbackTitle}>Map View</Text>
          <Text style={styles.mapFallbackText}>Interactive map on iOS/Android</Text>
          <View style={styles.webList}>
            {providers.map((p) => (
              <TouchableOpacity key={p.id} style={[styles.webRow, selectedId === p.id && styles.webRowActive]} onPress={() => setSelectedId(p.id)}>
                <AppImage uri={getProviderAvatar(p.id)} width={40} height={40} borderRadius={20} fallbackText={p.full_name || p.username || '?'} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.webName}>{p.full_name || p.username}</Text>
                  <Text style={styles.webSkill}>{p.services[0]?.title || 'Provider'}</Text>
                </View>
                <Text style={styles.webDist}>{formatDistance(p.distance)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : (
        <MapView ref={mapRef} style={styles.map} initialRegion={mapRegion} showsUserLocation showsMyLocationButton={false}>
          {providers.map((provider) => {
            const isSelected = provider.id === selectedId;
            return (
              <Marker key={provider.id} coordinate={{ latitude: provider.latitude, longitude: provider.longitude }} onPress={() => handleMarkerPress(provider)} zIndex={isSelected ? 10 : 1}>
                <View style={styles.markerOuter}>
                  <View style={[styles.markerCircle, isSelected && styles.markerCircleSelected]}>
                    <Image source={{ uri: getProviderAvatar(provider.id) }} style={[styles.markerImage, isSelected && styles.markerImageSelected]} resizeMode="cover" />
                  </View>
                  {isSelected && <View style={styles.markerPin}><View style={styles.markerPinTriangle} /></View>}
                </View>
              </Marker>
            );
          })}
        </MapView>
      )}

      {/* Empty state */}
      {!loading && providers.length === 0 && (
        <View style={styles.emptyOverlay}>
          <Text style={styles.emptyEmoji}>🌱</Text>
          <Text style={styles.emptyTitle}>No barterers in this area yet</Text>
          <Text style={styles.emptyText}>Be the first to join your local barter community!</Text>
          <TouchableOpacity style={styles.expandBtn} onPress={() => setRadius(Math.min(radius + 25, 150))}>
            <Text style={styles.expandBtnText}>Expand Search Radius</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Location error */}
      {locationError && (
        <View style={styles.errorBanner}>
          <Ionicons name="location-outline" size={16} color="#FF6B6B" />
          <Text style={styles.errorText}>Enable location to see barterers near you</Text>
        </View>
      )}

      {/* Preview Card */}
      {selectedProvider && (
        <Animated.View style={[styles.previewCard, { transform: [{ scale: cardAnim }] }]}>
          <TouchableOpacity style={styles.previewContent} activeOpacity={0.8} onPress={handlePreviewPress}>
            <View style={styles.previewPhotoContainer}>
              <AppImage uri={getProviderPhoto(selectedProvider.id)} width={80} height={80} borderRadius={8} fallbackText={selectedProvider.full_name || '?'} />
              <View style={[styles.previewBadge, { backgroundColor: BADGE_COLORS[selectedProvider.user_type] || '#00BCD4' }]}>
                <Ionicons name={BADGE_ICONS[selectedProvider.user_type] || 'person'} size={8} color="#FFF" />
                <Text style={styles.previewBadgeText}>{selectedProvider.user_type}</Text>
              </View>
            </View>
            <View style={styles.previewInfo}>
              <View style={styles.previewNameRow}>
                <AppImage uri={getProviderAvatar(selectedProvider.id)} width={36} height={36} borderRadius={18} fallbackText={selectedProvider.full_name || '?'} />
                <Text style={styles.previewName}>{selectedProvider.full_name || selectedProvider.username}</Text>
              </View>
              <Text style={styles.previewSkill}>{selectedProvider.services[0]?.title || 'Provider'}</Text>
              <Text style={styles.previewLocation}>
                {selectedProvider.location_city}{selectedProvider.location_state ? `, ${selectedProvider.location_state}` : ''} · {formatDistance(selectedProvider.distance)}
              </Text>
              <View style={styles.previewRatingRow}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <Text style={styles.previewRating}>{selectedProvider.rating}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </Animated.View>
      )}

      <FilterBottomSheet visible={showFilter} onClose={() => setShowFilter(false)} onApply={handleFilterApply} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { backgroundColor: '#1A1A1A', paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: borderRadius.lg, paddingHorizontal: spacing.md, height: 44 },
  searchInput: { flex: 1, fontSize: fontSize.sm, color: '#333', fontFamily: fonts.regular },
  filterRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm, paddingBottom: spacing.xs },
  filterIconPill: { backgroundColor: '#333', borderRadius: borderRadius.md, paddingHorizontal: 12, paddingVertical: 8, justifyContent: 'center', alignItems: 'center' },
  filterPill: { backgroundColor: '#333', borderRadius: borderRadius.md, paddingHorizontal: 12, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 6 },
  filterPillText: { color: '#FFF', fontSize: fontSize.xs, fontWeight: '500', fontFamily: fonts.semiBold },
  countText: { color: 'rgba(255,255,255,0.5)', fontSize: 11, fontFamily: fonts.regular, marginTop: 4 },
  map: { flex: 1 },
  loadingView: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.md },
  loadingText: { fontSize: fontSize.sm, color: '#999', fontFamily: fonts.regular },
  mapFallback: { flex: 1, backgroundColor: '#E8F4F8', justifyContent: 'flex-start', alignItems: 'center', paddingTop: spacing.lg, gap: spacing.sm },
  mapFallbackTitle: { fontSize: fontSize.lg, fontWeight: '600', color: colors.text, fontFamily: fonts.bold },
  mapFallbackText: { fontSize: fontSize.sm, color: colors.textMuted, marginBottom: spacing.md, fontFamily: fonts.regular },
  webList: { width: '100%', paddingHorizontal: spacing.md, gap: spacing.xs },
  webRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.sm, gap: spacing.sm },
  webRowActive: { borderWidth: 2, borderColor: colors.primary },
  webName: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text, fontFamily: fonts.semiBold },
  webSkill: { fontSize: fontSize.xs, color: colors.textMuted, fontFamily: fonts.regular },
  webDist: { fontSize: fontSize.xs, color: colors.textMuted, fontFamily: fonts.regular },
  markerOuter: { alignItems: 'center' },
  markerCircle: { width: 46, height: 46, borderRadius: 23, borderWidth: 2, borderColor: '#FFF', overflow: 'hidden', backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },
  markerCircleSelected: { width: 52, height: 52, borderRadius: 26, borderWidth: 3, borderColor: colors.primary },
  markerImage: { width: 42, height: 42, borderRadius: 21 },
  markerImageSelected: { width: 46, height: 46, borderRadius: 23 },
  markerPin: { alignItems: 'center', marginTop: -2 },
  markerPinTriangle: { width: 0, height: 0, borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 8, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: colors.primary },
  emptyOverlay: { position: 'absolute', top: '40%', left: 0, right: 0, alignItems: 'center', gap: spacing.sm, padding: spacing.xl },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: fontSize.lg, fontWeight: '700', color: '#000', fontFamily: fonts.bold, textAlign: 'center' },
  emptyText: { fontSize: fontSize.sm, color: '#999', fontFamily: fonts.regular, textAlign: 'center' },
  expandBtn: { backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  expandBtnText: { color: '#FFF', fontSize: fontSize.sm, fontFamily: fonts.bold },
  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFEBEE', paddingHorizontal: spacing.md, paddingVertical: 8 },
  errorText: { fontSize: fontSize.xs, color: '#C62828', fontFamily: fonts.regular },
  previewCard: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: spacing.md, paddingBottom: spacing.md },
  previewContent: { backgroundColor: colors.white, borderRadius: borderRadius.xl, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.12, shadowRadius: 10, elevation: 8 },
  previewPhotoContainer: { position: 'relative' },
  previewBadge: { position: 'absolute', bottom: 4, left: 4, flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: 5, paddingVertical: 2, borderRadius: borderRadius.sm },
  previewBadgeText: { fontSize: 8, fontWeight: '600', color: '#FFF', fontFamily: fonts.semiBold },
  previewInfo: { flex: 1, gap: 2 },
  previewNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  previewName: { fontSize: fontSize.md, fontWeight: '700', color: colors.text, fontFamily: fonts.bold },
  previewSkill: { fontSize: fontSize.sm, color: colors.textSecondary, fontFamily: fonts.regular },
  previewLocation: { fontSize: fontSize.xs, color: colors.textMuted, fontFamily: fonts.regular },
  previewRatingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  previewRating: { fontSize: fontSize.xs, fontWeight: '600', color: colors.text, fontFamily: fonts.semiBold },
});
