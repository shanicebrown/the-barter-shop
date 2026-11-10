import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { colors, spacing, fontSize, borderRadius, fonts } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'CommunityStandards'>;

const PROHIBITED = [
  'Illegal services of any kind',
  'Adult or sexual services',
  'Drug or substance-related services',
  'Weapons or dangerous goods',
  'Counterfeit or stolen goods',
  'Services that discriminate based on race, religion, gender, sexuality, age, or disability',
  'Any service violating local, state, or federal law',
];

const CELEBRATED = [
  'Professional skills and expertise',
  'Creative services and artistry',
  'Educational and coaching services',
  'Health and wellness services',
  'Home and business services',
  'Community building and connection',
];

export default function CommunityStandardsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [agreed, setAgreed] = useState(false);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Community Standards</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.warningIcon}>🚫</Text>
        <Text style={styles.title}>Community Standards</Text>
        <Text style={styles.subtitle}>The Barter Shop is a professional service exchange platform.</Text>

        {/* Prohibited */}
        <View style={styles.prohibitedCard}>
          <Text style={styles.prohibitedHeader}>
            The following are STRICTLY PROHIBITED and will result in IMMEDIATE account suspension and reporting to authorities:
          </Text>
          {PROHIBITED.map((item) => (
            <View key={item} style={styles.listRow}>
              <Ionicons name="close-circle" size={16} color="#FF6B6B" />
              <Text style={styles.prohibitedItem}>{item}</Text>
            </View>
          ))}
        </View>

        {/* Celebrated */}
        <View style={styles.celebratedCard}>
          <Text style={styles.celebratedHeader}>The Barter Shop celebrates:</Text>
          {CELEBRATED.map((item) => (
            <View key={item} style={styles.listRow}>
              <Ionicons name="checkmark-circle" size={16} color="#FFF" />
              <Text style={styles.celebratedItem}>{item}</Text>
            </View>
          ))}
        </View>

        {/* Agreement */}
        <TouchableOpacity style={styles.checkboxRow} onPress={() => setAgreed(!agreed)} activeOpacity={0.7}>
          <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
            {agreed && <Ionicons name="checkmark" size={14} color="#FFF" />}
          </View>
          <Text style={styles.checkboxText}>
            I confirm that all services I offer comply with all applicable laws and The Barter Shop's Community Standards. I understand that violations will result in immediate account removal.
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom || 16 }]}>
        <TouchableOpacity
          style={[styles.continueBtn, !agreed && { opacity: 0.4 }]}
          onPress={() => navigation.goBack()}
          disabled={!agreed}
        >
          <Text style={styles.continueBtnText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: 12 },
  headerTitle: { fontSize: fontSize.md, fontWeight: '700', color: '#000', fontFamily: fonts.bold },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: 100 },
  warningIcon: { fontSize: 48, textAlign: 'center' },
  title: { fontSize: 28, fontWeight: '700', color: '#000', textAlign: 'center', fontFamily: fonts.extraBold },
  subtitle: { fontSize: fontSize.md, color: '#999', textAlign: 'center', fontFamily: fonts.regular },

  prohibitedCard: { backgroundColor: '#FFEBEE', borderRadius: 16, padding: spacing.md, gap: 10 },
  prohibitedHeader: { fontSize: fontSize.sm, fontWeight: '700', color: '#C62828', lineHeight: 20, fontFamily: fonts.bold },
  prohibitedItem: { flex: 1, fontSize: fontSize.sm, color: '#C62828', fontFamily: fonts.regular },

  celebratedCard: { backgroundColor: colors.primary, borderRadius: 16, padding: spacing.md, gap: 10 },
  celebratedHeader: { fontSize: fontSize.sm, fontWeight: '700', color: '#FFF', fontFamily: fonts.bold },
  celebratedItem: { flex: 1, fontSize: fontSize.sm, color: '#FFF', fontFamily: fonts.regular },

  listRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },

  checkboxRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 4 },
  checkbox: { width: 22, height: 22, borderRadius: 4, borderWidth: 2, borderColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center', marginTop: 1 },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkboxText: { flex: 1, fontSize: fontSize.sm, color: '#666', lineHeight: 20, fontFamily: fonts.regular },

  bottomBar: { paddingHorizontal: spacing.md, paddingTop: 12, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  continueBtn: { backgroundColor: colors.primary, height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  continueBtnText: { color: '#FFF', fontSize: fontSize.md, fontWeight: '700', fontFamily: fonts.bold },
});
