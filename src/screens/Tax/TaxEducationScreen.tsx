import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { colors, spacing, fontSize, borderRadius, fonts } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'TaxEducation'>;

export default function TaxEducationScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Understanding Barter Taxes</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Ionicons name="calculator" size={36} color={colors.primary} />
          <Text style={styles.heroTitle}>Tax & Bartering</Text>
          <Text style={styles.heroSubtitle}>What you need to know</Text>
        </View>

        <Section title="What This Means for You">
          The IRS considers barter income taxable at fair market value.{'\n\n'}When you receive a service through The Barter Shop, the fair market value of that service is considered income — even though no cash changed hands.
        </Section>

        <View style={styles.exampleCard}>
          <Text style={styles.exampleTitle}>Example</Text>
          <Text style={styles.exampleText}>
            You trade 3 personal training sessions ($300 value) for a photography session ($300 value). You must report $300 of income from the photography you received.
          </Text>
        </View>

        <Section title="What The Barter Shop Provides">
          {`• Annual Barter Activity Statement showing all your transactions and their fair market values
• Transaction records for your tax preparer
• Your statement is available in Settings > Tax Documents every January`}
        </Section>

        <Section title="What You Need to Do">
          {`• Report barter income on Schedule C (self-employed) or Schedule 1
• Consult a tax professional for your specific situation
• Save your Annual Barter Statement for your records`}
        </Section>

        <Section title="Helpful IRS Resources">
          {`• IRS Topic 420: Bartering Income
• IRS Publication 525: Taxable and Nontaxable Income
• irs.gov/taxtopics/tc420`}
        </Section>

        <View style={styles.disclaimerCard}>
          <Ionicons name="information-circle" size={20} color="#666" />
          <Text style={styles.disclaimerText}>
            The Barter Shop is not a tax advisor. This information is for educational purposes only. Please consult a qualified tax professional for guidance specific to your situation.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionBody}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  headerTitle: { fontSize: fontSize.md, fontWeight: '700', color: '#000', fontFamily: fonts.bold },
  content: { padding: spacing.md, paddingBottom: 40 },
  heroCard: { alignItems: 'center', backgroundColor: '#F0FAFB', borderRadius: 16, padding: spacing.lg, gap: 8, marginBottom: spacing.lg },
  heroTitle: { fontSize: 22, fontWeight: '700', color: '#000', fontFamily: fonts.extraBold },
  heroSubtitle: { fontSize: fontSize.sm, color: '#999', fontFamily: fonts.regular },
  section: { marginBottom: spacing.lg },
  sectionTitle: { fontSize: fontSize.md, fontWeight: '700', color: '#000', fontFamily: fonts.bold, marginBottom: spacing.sm },
  sectionBody: { fontSize: fontSize.sm, color: '#666', lineHeight: 22, fontFamily: fonts.regular },
  exampleCard: { backgroundColor: '#FFFDE7', borderRadius: 12, padding: spacing.md, marginBottom: spacing.lg, borderLeftWidth: 3, borderLeftColor: '#FFD700' },
  exampleTitle: { fontSize: fontSize.sm, fontWeight: '700', color: '#8B6914', fontFamily: fonts.bold, marginBottom: 4 },
  exampleText: { fontSize: fontSize.sm, color: '#666', lineHeight: 22, fontFamily: fonts.regular },
  disclaimerCard: { flexDirection: 'row', backgroundColor: '#F8F8F8', borderRadius: 12, padding: spacing.md, gap: 10, alignItems: 'flex-start' },
  disclaimerText: { flex: 1, fontSize: fontSize.xs, color: '#999', lineHeight: 18, fontFamily: fonts.regular },
});
