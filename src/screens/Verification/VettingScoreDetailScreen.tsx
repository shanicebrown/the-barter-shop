import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { calculateVettingScore } from '../../services/VettingScore';
import { colors, spacing, fontSize, borderRadius, fonts } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'VettingScoreDetail'>;

// Demo data
const DEMO_RESULT = calculateVettingScore({
  verifications: { government_id: 'approved', selfie_match: 'approved', phone_number: 'approved', skill_credential: 'pending', portfolio: 'approved' },
  completionRate: 97,
  rating: 4.9,
  barterCount: 12,
  flagsCount: 0,
  unsignedCount: 0,
  isBusiness: false,
});

export default function VettingScoreDetailScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const result = DEMO_RESULT;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={26} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vetting Score</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Score Circle */}
        <View style={styles.scoreCircle}>
          <View style={[styles.scoreRing, { borderColor: result.color }]}>
            <Text style={[styles.scoreNumber, { color: result.color }]}>{result.score}</Text>
            <Text style={styles.scoreMax}>/100</Text>
          </View>
          <Text style={[styles.scoreLabel, { color: result.color }]}>{result.label}</Text>
        </View>

        {/* Breakdown */}
        <Text style={styles.sectionTitle}>Score Breakdown</Text>
        {result.breakdown.map((item, i) => (
          <View key={i} style={styles.breakdownRow}>
            <Ionicons
              name={item.status === 'earned' ? 'checkmark-circle' : item.status === 'pending' ? 'time' : 'close-circle'}
              size={18}
              color={item.status === 'earned' ? '#4CAF50' : item.status === 'pending' ? '#FF9800' : '#CCC'}
            />
            <Text style={styles.breakdownLabel}>{item.label}</Text>
            <Text style={[styles.breakdownPoints, item.points < 0 && { color: '#F44336' }]}>
              {item.points > 0 ? '+' : ''}{item.points}/{item.maxPoints}
            </Text>
          </View>
        ))}

        {/* How to improve */}
        <View style={styles.improveCard}>
          <Text style={styles.improveTitle}>How to improve your score</Text>
          <Text style={styles.improveText}>• Complete any pending verifications</Text>
          <Text style={styles.improveText}>• Maintain a high completion rate</Text>
          <Text style={styles.improveText}>• Upload a portfolio of your work</Text>
          <Text style={styles.improveText}>• Complete more barters to build trust</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: 12 },
  headerTitle: { fontSize: fontSize.lg, fontWeight: '700', color: '#000', fontFamily: fonts.bold },
  content: { padding: spacing.md, gap: spacing.md },
  scoreCircle: { alignItems: 'center', gap: 8, marginVertical: spacing.md },
  scoreRing: { width: 120, height: 120, borderRadius: 60, borderWidth: 6, justifyContent: 'center', alignItems: 'center' },
  scoreNumber: { fontSize: 36, fontWeight: '900', fontFamily: fonts.black },
  scoreMax: { fontSize: fontSize.sm, color: '#999', fontFamily: fonts.regular },
  scoreLabel: { fontSize: fontSize.md, fontWeight: '700', fontFamily: fonts.bold },
  sectionTitle: { fontSize: fontSize.md, fontWeight: '700', color: '#000', fontFamily: fonts.bold },
  breakdownRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  breakdownLabel: { flex: 1, fontSize: fontSize.sm, color: '#333', fontFamily: fonts.regular },
  breakdownPoints: { fontSize: fontSize.sm, fontWeight: '600', color: '#4CAF50', fontFamily: fonts.semiBold },
  improveCard: { backgroundColor: '#E0F7FA', borderRadius: 12, padding: spacing.md, gap: 6, marginTop: spacing.sm },
  improveTitle: { fontSize: fontSize.sm, fontWeight: '700', color: '#00838F', fontFamily: fonts.bold },
  improveText: { fontSize: fontSize.xs, color: '#00838F', fontFamily: fonts.regular },
});
