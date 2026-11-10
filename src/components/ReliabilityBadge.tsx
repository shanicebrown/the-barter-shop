import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getReliabilityBadge } from '../services/AccountabilityService';
import { WarningLevel } from '../types/database';
import { fontSize, borderRadius, fonts } from '../theme';

type Props = {
  completionRate: number;
  barterCount: number;
  warningLevel: WarningLevel;
  showRate?: boolean;
};

export default function ReliabilityBadge({ completionRate, barterCount, warningLevel, showRate = true }: Props) {
  const badge = getReliabilityBadge(completionRate, barterCount, warningLevel);
  if (!badge && !showRate) return null;

  return (
    <View style={styles.container}>
      {badge && (
        <View style={[styles.badge, { backgroundColor: badge.color + '15', borderColor: badge.color + '40' }]}>
          <Text style={styles.badgeEmoji}>{badge.emoji}</Text>
          <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
        </View>
      )}
      {showRate && (
        <Text style={styles.rateText}>✅ {Math.round(completionRate)}% completion rate ({barterCount} barters)</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 4 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: borderRadius.full, borderWidth: 1, alignSelf: 'flex-start' },
  badgeEmoji: { fontSize: 12 },
  badgeText: { fontSize: 11, fontWeight: '600', fontFamily: fonts.semiBold },
  rateText: { fontSize: 11, color: '#999', fontFamily: fonts.regular },
});
