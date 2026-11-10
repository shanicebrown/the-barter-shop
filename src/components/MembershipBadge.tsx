import React from 'react';
import { View, Image, Text, StyleSheet, ImageSourcePropType } from 'react-native';
import { fonts } from '../theme';

type VerificationStatus = 'unverified' | 'pending_review' | 'verified_pro' | 'verified_business' | 'suspended';

type Props = {
  status: VerificationStatus;
  size?: number;
  showLabel?: boolean;
};

const BADGE_IMAGES: Record<string, ImageSourcePropType> = {
  community: require('../../assets/badge-community.png'),
  verified_pro: require('../../assets/badge-verified-pro.png'),
  business: require('../../assets/badge-business.png'),
};

const BADGE_CONFIG: Record<VerificationStatus, { image: string; label: string; color: string }> = {
  unverified: { image: 'community', label: 'Community Member', color: '#999' },
  pending_review: { image: 'community', label: 'Pending Verification', color: '#FF9800' },
  verified_pro: { image: 'verified_pro', label: 'Verified Pro ✅', color: '#00BCD4' },
  verified_business: { image: 'business', label: 'Verified Business 🏢', color: '#FFD700' },
  suspended: { image: 'community', label: 'Account Suspended', color: '#F44336' },
};

export default function MembershipBadge({ status, size = 32, showLabel = false }: Props) {
  const config = BADGE_CONFIG[status] || BADGE_CONFIG.unverified;
  const isPending = status === 'pending_review';

  return (
    <View style={styles.container}>
      <View style={{ width: size, height: size }}>
        <Image
          source={BADGE_IMAGES[config.image]}
          style={{ width: size, height: size, borderRadius: size / 2 }}
          resizeMode="contain"
        />
        {isPending && (
          <View style={[styles.pendingOverlay, { width: size, height: size, borderRadius: size / 2 }]}>
            <Text style={[styles.pendingText, { fontSize: size * 0.2 }]}>Pending</Text>
          </View>
        )}
      </View>
      {showLabel && (
        <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 4 },
  pendingOverlay: { position: 'absolute', backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  pendingText: { color: '#FFF', fontWeight: '700', fontFamily: fonts.bold },
  label: { fontSize: 12, fontWeight: '600', fontFamily: fonts.semiBold },
});
