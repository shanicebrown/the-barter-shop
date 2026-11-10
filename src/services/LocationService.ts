import * as Location from 'expo-location';
import { supabase } from '../config/supabase';

// ── Distance Calculation (Haversine) ───────────────────────
export function calculateDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ── Format Distance ────────────────────────────────────────
export function formatDistance(km: number): string {
  if (km < 1) return `${(km * 1000).toFixed(0)}m away`;
  if (km < 10) return `${km.toFixed(1)} km away`;
  return `${Math.round(km)} km away`;
}

// ── Fuzz Location for Privacy ──────────────────────────────
export function fuzzLocation(lat: number, lng: number): { latitude: number; longitude: number } {
  // Random offset ±0.5km (≈0.0045 degrees)
  const fuzzedLat = lat + (Math.random() - 0.5) * 0.009;
  const fuzzedLng = lng + (Math.random() - 0.5) * 0.009;
  return { latitude: fuzzedLat, longitude: fuzzedLng };
}

/** Resolves to null if the promise takes longer than `ms` (GPS fixes and geocoding can hang indoors). */
export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
  ]);
}

// ── Request Permission + Get Location ──────────────────────
export async function getUserLocation(): Promise<{
  coords: Location.LocationObjectCoords;
  city: string;
  state: string;
} | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return null;

    const loc =
      (await Location.getLastKnownPositionAsync({ maxAge: 10 * 60 * 1000 }).catch(() => null)) ??
      (await withTimeout(Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }), 8000));
    if (!loc) return null;

    let city = '';
    let state = '';
    try {
      const [address] = (await withTimeout(Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      }), 4000)) ?? [];
      city = address?.city || '';
      state = address?.region || '';
    } catch {
      // Reverse geocoding may fail silently
    }

    return { coords: loc.coords, city, state };
  } catch (e) {
    console.log('Location error:', e);
    return null;
  }
}

// ── Update User Location in Supabase ───────────────────────
export async function updateUserLocation(
  userId: string,
  coords: Location.LocationObjectCoords,
  city: string,
  state: string,
): Promise<void> {
  const fuzzed = fuzzLocation(coords.latitude, coords.longitude);
  try {
    await supabase.from('profiles').update({
      latitude: fuzzed.latitude,
      longitude: fuzzed.longitude,
      location_city: city,
      location_state: state,
      location_updated_at: new Date().toISOString(),
    }).eq('id', userId);
  } catch (e) {
    console.log('Location update error:', e);
  }
}

// ── Query Nearby Providers ─────────────────────────────────
export type NearbyProvider = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  user_type: string;
  verification_status: string;
  rating: number;
  barter_count: number;
  latitude: number;
  longitude: number;
  location_city: string | null;
  location_state: string | null;
  distance: number;
  services: { id: string; title: string; category: string | null; barter_type: string; value: number }[];
};

export async function getNearbyProviders(
  userLat: number,
  userLng: number,
  radiusKm: number = 50,
  currentUserId?: string,
): Promise<NearbyProvider[]> {
  const latRange = radiusKm / 111;
  const lngRange = radiusKm / (111 * Math.cos(userLat * Math.PI / 180));

  try {
    let query = supabase
      .from('profiles')
      .select(`
        id, username, full_name, avatar_url, user_type, verification_status,
        rating, barter_count, latitude, longitude, location_city, location_state,
        services ( id, title, category, barter_type, value )
      `)
      .gte('latitude', userLat - latRange)
      .lte('latitude', userLat + latRange)
      .gte('longitude', userLng - lngRange)
      .lte('longitude', userLng + lngRange)
      .not('latitude', 'is', null)
      .order('rating', { ascending: false })
      .limit(50);

    if (currentUserId) {
      query = query.neq('id', currentUserId);
    }

    const { data, error } = await query;
    if (error) {
      console.log('Nearby query error:', error.message);
      return [];
    }

    return (data || [])
      .map((p: any) => ({
        ...p,
        distance: calculateDistance(userLat, userLng, p.latitude, p.longitude),
        services: p.services || [],
      }))
      .filter((p: NearbyProvider) => p.distance <= radiusKm)
      .sort((a: NearbyProvider, b: NearbyProvider) => a.distance - b.distance);
  } catch (e) {
    console.log('Nearby providers error:', e);
    return [];
  }
}

// ── Geocode Search ─────────────────────────────────────────
export async function geocodeSearch(query: string): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const results = await Location.geocodeAsync(query);
    if (results.length > 0) {
      return { latitude: results[0].latitude, longitude: results[0].longitude };
    }
    return null;
  } catch {
    return null;
  }
}
